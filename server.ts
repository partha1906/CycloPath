import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_ASSETS, DATA_SOURCES_SEED } from './server/data/seedData';
import { cycloneService } from './server/services/cycloneService';
import { riskEngine, RiskWeights, DEFAULT_WEIGHTS } from './server/services/riskEngine';
import { mlService } from './server/services/mlService';
import { routingService } from './server/services/routingService';
import { alertService } from './server/services/alertService';
import { reportService } from './server/services/reportService';
import { geminiService } from './server/services/geminiService';
import { agentService } from './server/services/agentService';
import {
  authenticateUser,
  issueTokenForUser,
  verifyToken,
  DEMO_USERS,
  ROLE_ALIASES,
} from './server/services/security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const START_TIME = Date.now();

app.use(express.json({ limit: '20mb' }));

// CORS headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Role');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Cache of evaluated assets
let ASSETS_DB: any[] = [];

function initAssetsDb() {
  if (ASSETS_DB.length === 0) {
    const cyclone = cycloneService.getDefaultCycloneSamudra();
    ASSETS_DB = SEED_ASSETS.map((raw: any, idx: number) => {
      const asset = { ...raw, id: idx + 1 };
      const [distKm, cycloneExp] = cycloneService.calculateCycloneExposure(
        asset.latitude,
        asset.longitude,
        cyclone.current_lat,
        cyclone.current_lng,
        cyclone.max_wind_speed_kmh
      );
      const evalRes = riskEngine.evaluateAsset(
        asset,
        cycloneExp,
        cyclone.rainfall_24h_mm,
        cyclone.storm_surge_potential_m
      );
      const mlPred = mlService.predictAssetVulnerability(
        asset,
        cyclone.max_wind_speed_kmh,
        cyclone.rainfall_24h_mm,
        distKm,
        cyclone.storm_surge_potential_m
      );

      asset.distance_to_cyclone_km = Math.round(distKm * 10) / 10;
      asset.risk_assessment = evalRes;
      asset.ml_prediction = mlPred;
      return asset;
    });
  }
}

initAssetsDb();

function getAllAssetsEvaluated(windKmh?: number, rainMm?: number, surgeM?: number): any[] {
  const cyclone = cycloneService.getDefaultCycloneSamudra();
  const effectiveWind = windKmh ?? cyclone.max_wind_speed_kmh;
  const effectiveRain = rainMm ?? cyclone.rainfall_24h_mm;
  const effectiveSurge = surgeM ?? cyclone.storm_surge_potential_m;

  return ASSETS_DB.map((raw: any) => {
    const asset = { ...raw };
    const [distKm, cycloneExp] = cycloneService.calculateCycloneExposure(
      asset.latitude,
      asset.longitude,
      cyclone.current_lat,
      cyclone.current_lng,
      effectiveWind
    );
    const evalRes = riskEngine.evaluateAsset(asset, cycloneExp, effectiveRain, effectiveSurge);
    const mlPred = mlService.predictAssetVulnerability(
      asset,
      effectiveWind,
      effectiveRain,
      distKm,
      effectiveSurge
    );

    asset.distance_to_cyclone_km = Math.round(distKm * 10) / 10;
    asset.risk_assessment = evalRes;
    asset.ml_prediction = mlPred;
    return asset;
  });
}

function getAuthenticatedUser(req: Request): Record<string, any> | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1].trim();
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

const SIMULATION_HISTORY: any[] = [];

// ======================== API ROUTER ========================
const apiRouter = express.Router();

// Root API Status
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    platform: 'Cyclopath AI',
    tagline: 'Predict the impact. Protect the infrastructure. Save communities.',
    version: '1.0.0',
    status: 'Operational',
    mode: 'Demo Simulation (Severe Cyclone SAMUDRA — Coastal Odisha Swath)',
    disclaimer:
      'AI-generated risk estimates are decision-support outputs and should be validated against official IMD and SDMA information before operational use.',
  });
});

// Authentication
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const user = authenticateUser(username || '', password || '');
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }
  const token = issueTokenForUser(user);
  res.json({
    access_token: token,
    token_type: 'bearer',
    username: user.username,
    role: user.role,
    title: user.title,
    agency: user.agency,
  });
});

apiRouter.post('/auth/demo-token', (req: Request, res: Response) => {
  const roleReq = req.body?.role || 'Disaster_Authority';
  const targetRole = ROLE_ALIASES[roleReq] || roleReq;
  let matched = Object.values(DEMO_USERS).find((u) => u.role.toLowerCase() === targetRole.toLowerCase());
  if (!matched) {
    matched = DEMO_USERS.citizen;
  }
  const token = issueTokenForUser(matched);
  res.json({
    access_token: token,
    token_type: 'bearer',
    username: matched.username,
    role: matched.role,
    title: matched.title,
    agency: matched.agency,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
    return;
  }
  res.json({ status: 'authenticated', verified_claims: user });
});

// Cyclones
apiRouter.get('/cyclones', (_req: Request, res: Response) => {
  const samudra = cycloneService.getDefaultCycloneSamudra();
  res.json([samudra]);
});

apiRouter.get('/cyclones/:id', (req: Request, res: Response) => {
  const samudra = cycloneService.getDefaultCycloneSamudra();
  const id = parseInt(req.params.id, 10);
  if (id !== samudra.id && id !== 1) {
    res.status(404).json({ error: 'Cyclone scenario not found' });
    return;
  }
  res.json(samudra);
});

// Infrastructure
apiRouter.get('/infrastructure', (req: Request, res: Response) => {
  let assets = getAllAssetsEvaluated();
  const assetType = req.query.asset_type as string | undefined;
  const district = req.query.district as string | undefined;
  const riskCategory = req.query.risk_category as string | undefined;
  const search = req.query.search as string | undefined;

  if (assetType) {
    assets = assets.filter((a) => a.asset_type.toLowerCase() === assetType.toLowerCase());
  }
  if (district) {
    assets = assets.filter((a) => a.district.toLowerCase().includes(district.toLowerCase()));
  }
  if (riskCategory) {
    assets = assets.filter((a) => a.risk_assessment?.risk_category.toLowerCase() === riskCategory.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        a.asset_id.toLowerCase().includes(s) ||
        a.district.toLowerCase().includes(s)
    );
  }
  res.json(assets);
});

apiRouter.get('/infrastructure/:assetId', (req: Request, res: Response) => {
  const assetId = req.params.assetId;
  const assets = getAllAssetsEvaluated();
  const matched = assets.find(
    (a) => String(a.id) === assetId || a.asset_id.toLowerCase() === assetId.toLowerCase()
  );
  if (!matched) {
    res.status(404).json({ error: 'Infrastructure asset not found' });
    return;
  }
  res.json(matched);
});

// Risk Engine Summary & Weights
apiRouter.get('/risk/summary', (_req: Request, res: Response) => {
  const assets = getAllAssetsEvaluated();
  const total = assets.length;
  const critical = assets.filter((a) => a.risk_assessment?.risk_category === 'Critical').length;
  const high = assets.filter((a) => a.risk_assessment?.risk_category === 'High').length;
  const moderate = assets.filter((a) => a.risk_assessment?.risk_category === 'Moderate').length;
  const low = assets.filter((a) => a.risk_assessment?.risk_category === 'Low').length;

  const hospitalsAtRisk = assets.filter(
    (a) => a.asset_type === 'hospital' && ['Critical', 'High'].includes(a.risk_assessment?.risk_category)
  ).length;
  const powerAtRisk = assets.filter(
    (a) => a.asset_type === 'power_station' && ['Critical', 'High'].includes(a.risk_assessment?.risk_category)
  ).length;
  const bridgesAtRisk = assets.filter(
    (a) => a.asset_type === 'bridge' && ['Critical', 'High'].includes(a.risk_assessment?.risk_category)
  ).length;
  const roadsAtRisk = assets.filter(
    (a) => a.asset_type === 'road' && ['Critical', 'High'].includes(a.risk_assessment?.risk_category)
  ).length;
  const sheltersActive = assets.filter((a) => a.asset_type === 'school_shelter').length;

  const districtMap: Record<string, { district: string; state: string; total: number; critical: number; high: number; scores: number[] }> = {};
  for (const a of assets) {
    const d = a.district;
    if (!districtMap[d]) {
      districtMap[d] = { district: d, state: a.state, total: 0, critical: 0, high: 0, scores: [] };
    }
    districtMap[d].total += 1;
    const score = a.risk_assessment?.overall_vulnerability_score || 0;
    districtMap[d].scores.push(score);
    if (a.risk_assessment?.risk_category === 'Critical') {
      districtMap[d].critical += 1;
    } else if (a.risk_assessment?.risk_category === 'High') {
      districtMap[d].high += 1;
    }
  }

  const districtBreakdown = Object.values(districtMap).map((info) => {
    const avgScore = info.scores.length > 0 ? Math.round((info.scores.reduce((a, b) => a + b, 0) / info.scores.length) * 10) / 10 : 0;
    return {
      district: info.district,
      state: info.state,
      total_assets: info.total,
      critical_assets: info.critical,
      high_risk_assets: info.high,
      avg_vulnerability_score: avgScore,
    };
  });
  districtBreakdown.sort((a, b) => b.avg_vulnerability_score - a.avg_vulnerability_score);

  res.json({
    total_monitored: total,
    critical_assets: critical,
    high_risk_assets: high,
    moderate_risk_assets: moderate,
    low_risk_assets: low,
    hospitals_at_risk: hospitalsAtRisk,
    power_stations_at_risk: powerAtRisk,
    bridges_at_risk: bridgesAtRisk,
    roads_at_risk: roadsAtRisk,
    shelters_active: sheltersActive,
    estimated_affected_population: 485000,
    evacuation_priority_zones: ['Puri Coastal Block', 'Paradip Industrial Rim', 'Astaranga Delta', 'Erasama Sector'],
    category_distribution: [
      { name: 'Critical (>80)', count: critical, fill: '#ef4444' },
      { name: 'High (61-80)', count: high, fill: '#f97316' },
      { name: 'Moderate (31-60)', count: moderate, fill: '#eab308' },
      { name: 'Low (0-30)', count: low, fill: '#22c55e' },
    ],
    district_breakdown: districtBreakdown,
  });
});

apiRouter.get('/risk/weights', (_req: Request, res: Response) => {
  res.json(riskEngine.weights);
});

apiRouter.post('/risk/weights', (req: Request, res: Response) => {
  const verifiedUser = getAuthenticatedUser(req);
  if (!verifiedUser) {
    res.status(401).json({
      error: 'Unauthorized: Authentication required to modify risk weights. Provide Bearer token.',
    });
    return;
  }
  const role = verifiedUser.role || '';
  if (!['Disaster Management Authority', 'Municipal Officer'].includes(role)) {
    res.status(403).json({
      error: `Forbidden: Administrative clearance required. Current role '${role}' is not authorized.`,
    });
    return;
  }

  const newWeights = req.body as Partial<RiskWeights>;
  riskEngine.setWeights(newWeights);
  res.json(riskEngine.weights);
});

apiRouter.get('/risk/heatmap', (_req: Request, res: Response) => {
  const assets = getAllAssetsEvaluated();
  const points = assets.map((a) => [
    a.latitude,
    a.longitude,
    Math.round(((a.risk_assessment?.overall_vulnerability_score || 0) / 100.0) * 100) / 100,
  ]);
  res.json({ points });
});

// Scenario Simulator
apiRouter.post('/simulation', (req: Request, res: Response) => {
  const { wind_speed_kmh, rainfall_mm, storm_surge_m } = req.body || {};
  const baselineAssets = getAllAssetsEvaluated();
  const baselineCritical = baselineAssets.filter((a) => a.risk_assessment?.risk_category === 'Critical').length;

  const scenarioAssets = getAllAssetsEvaluated(wind_speed_kmh, rainfall_mm, storm_surge_m);
  const scenarioCritical = scenarioAssets.filter((a) => a.risk_assessment?.risk_category === 'Critical').length;
  const scenarioHigh = scenarioAssets.filter((a) => a.risk_assessment?.risk_category === 'High').length;

  let increasePct = 0;
  if (baselineCritical > 0) {
    increasePct = Math.round(((scenarioCritical - baselineCritical) / baselineCritical) * 1000) / 10;
  } else if (scenarioCritical > 0) {
    increasePct = 100.0;
  }

  const newlyCritical: any[] = [];
  for (let i = 0; i < baselineAssets.length; i++) {
    const b = baselineAssets[i];
    const s = scenarioAssets[i];
    if (b.risk_assessment?.risk_category !== 'Critical' && s.risk_assessment?.risk_category === 'Critical') {
      newlyCritical.push({
        asset_id: s.asset_id,
        name: s.name,
        type: s.asset_type,
        district: s.district,
        old_score: b.risk_assessment?.overall_vulnerability_score,
        new_score: s.risk_assessment?.overall_vulnerability_score,
        score_jump: Math.round((s.risk_assessment?.overall_vulnerability_score - b.risk_assessment?.overall_vulnerability_score) * 10) / 10,
      });
    }
  }
  newlyCritical.sort((a, b) => b.score_jump - a.score_jump);

  const popMult = (wind_speed_kmh / 150.0) * (1.0 + storm_surge_m / 4.0);
  const estPop = Math.min(1250000, Math.floor(380000 * popMult));

  const districtCounts: Record<string, number> = {};
  for (const a of scenarioAssets) {
    if (['Critical', 'High'].includes(a.risk_assessment?.risk_category)) {
      districtCounts[a.district] = (districtCounts[a.district] || 0) + 1;
    }
  }
  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([district, affected_assets]) => ({ district, affected_assets }));

  if (newlyCritical.length > 0) {
    alertService.addSimulationAlert(
      `SIMULATION ALERT: Wind ${wind_speed_kmh}km/h & Surge ${storm_surge_m}m Triggered`,
      scenarioCritical > baselineCritical ? 'CRITICAL' : 'WARNING',
      newlyCritical[0].district,
      newlyCritical[0].name,
      `Simulation results indicate ${newlyCritical.length} assets transitioned into Critical Vulnerability. Priority action: inspect ${newlyCritical[0].name}.`,
      'Review updated scenario evacuation route and pre-position standby generators.'
    );
  }

  const simId = SIMULATION_HISTORY.length + 1;
  const result = {
    simulation_id: simId,
    name: `What-If: ${wind_speed_kmh} km/h, ${rainfall_mm}mm, ${storm_surge_m}m Surge`,
    scenario_wind_kmh: wind_speed_kmh,
    scenario_rain_mm: rainfall_mm,
    scenario_surge_m: storm_surge_m,
    critical_assets_count: scenarioCritical,
    high_risk_assets_count: scenarioHigh,
    population_affected_est: estPop,
    baseline_critical_count: baselineCritical,
    critical_increase_pct: increasePct,
    top_affected_districts: topDistricts,
    newly_critical_assets: newlyCritical.slice(0, 6),
    disclaimer: 'Cyclopath AI Prototype Scenario Simulation - Not an official IMD evacuation order',
  };
  SIMULATION_HISTORY.push(result);
  res.json(result);
});

apiRouter.get('/simulation/history', (_req: Request, res: Response) => {
  res.json(SIMULATION_HISTORY);
});

// AI Agent
apiRouter.post('/agent/query', async (req: Request, res: Response) => {
  const { query, district, asset_id, language } = req.body || {};
  const assets = getAllAssetsEvaluated();
  const cyclone = cycloneService.getDefaultCycloneSamudra();
  const plan = await agentService.analyzeAndPlan(query || 'Assess risk posture', district, asset_id, language || 'en', {
    assets,
    cyclone,
  });
  res.json(plan);
});

apiRouter.post('/agent/chat', async (req: Request, res: Response) => {
  const { query, district, asset_id, language } = req.body || {};
  const assets = getAllAssetsEvaluated();
  const cyclone = cycloneService.getDefaultCycloneSamudra();
  const plan = await agentService.analyzeAndPlan(query || 'Assess risk posture', district, asset_id, language || 'en', {
    assets,
    cyclone,
  });
  res.json(plan);
});

// Multimodal Image Inspection
apiRouter.post('/multimodal/analyze', async (req: Request, res: Response) => {
  const { image_base64, asset_id, context_notes } = req.body || {};
  const analysis = await geminiService.analyzeInfrastructureImage(image_base64, asset_id, context_notes);
  res.json(analysis);
});

// Emergency Routing
apiRouter.post('/routes/optimize', (req: Request, res: Response) => {
  const { start_lat, start_lng, end_lat, end_lng, avoid_high_flood, vehicle_type } = req.body || {};
  const route = routingService.calculateOptimalRoute(
    start_lat ?? 19.821,
    start_lng ?? 85.845,
    end_lat ?? 20.2312,
    end_lng ?? 85.778,
    avoid_high_flood !== false,
    vehicle_type || 'ambulance'
  );
  res.json(route);
});

// Alerts
apiRouter.get('/alerts', (req: Request, res: Response) => {
  const severity = req.query.severity as string | undefined;
  const district = req.query.district as string | undefined;
  const alerts = alertService.getAllAlerts(severity, district);
  res.json(alerts);
});

apiRouter.post('/alerts/:id/ack', (req: Request, res: Response) => {
  const alertId = parseInt(req.params.id, 10);
  const verifiedUser = getAuthenticatedUser(req);
  if (!verifiedUser) {
    res.status(401).json({ error: 'Unauthorized: Bearer token required to acknowledge disaster alerts' });
    return;
  }
  const role = verifiedUser.role || '';
  if (!['Disaster Management Authority', 'Municipal Officer', 'Emergency Responder'].includes(role)) {
    res.status(403).json({ error: 'Forbidden: Operational clearance required. Public accounts cannot acknowledge alerts.' });
    return;
  }

  const success = alertService.acknowledgeAlert(alertId);
  if (!success) {
    res.status(404).json({ error: 'Alert ID not found' });
    return;
  }
  res.json({
    status: 'acknowledged',
    alert_id: alertId,
    acknowledged_by: verifiedUser.sub || 'command_staff',
    role: verifiedUser.role,
  });
});

// Reports
apiRouter.get('/reports/latest', (_req: Request, res: Response) => {
  const assets = getAllAssetsEvaluated();
  const cyclone = cycloneService.getDefaultCycloneSamudra();
  const critical = assets.filter((a) => a.risk_assessment?.risk_category === 'Critical');
  const high = assets.filter((a) => a.risk_assessment?.risk_category === 'High');
  critical.sort((a, b) => (b.risk_assessment?.overall_vulnerability_score || 0) - (a.risk_assessment?.overall_vulnerability_score || 0));

  const report = reportService.generateAssessmentReport(
    cyclone,
    assets,
    critical.length,
    high.length,
    assets.length,
    critical
  );
  res.json(report);
});

// Health Observability
apiRouter.get('/health', (_req: Request, res: Response) => {
  const uptime = (Date.now() - START_TIME) / 1000;
  res.json({
    status: 'OPERATIONAL',
    backend: 'ONLINE (Cyclopath Full-Stack Node.js/Express)',
    database: 'ONLINE (In-Memory Coastal Geodatabase / Cloud SQL Ready)',
    ai_engine: 'ONLINE (Google Gemini Flash & Multimodal Vision)',
    map_engine: 'ONLINE (Leaflet / CartoDB Voyager Light / GIS Layers)',
    ml_service: 'ONLINE (Random Forest Surrogate Ensemble 25 Trees)',
    data_pipeline: 'ONLINE (IMD + ISRO Bhuvan + OSM Feeds)',
    active_scenario: 'Severe Cyclone SAMUDRA (Coastal Odisha Swath)',
    uptime_seconds: Math.round(uptime * 10) / 10,
    timestamp: new Date().toISOString(),
  });
});

// Data Sources
apiRouter.get('/data-sources', (_req: Request, res: Response) => {
  const sources = DATA_SOURCES_SEED.map((d: any, idx: number) => ({ ...d, id: idx + 1 }));
  res.json(sources);
});

// Mount /api
app.use('/api', apiRouter);

// Start server with Vite or static
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyclopath AI Fullstack Server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
