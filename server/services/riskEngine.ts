export interface RiskWeights {
  cyclone_exposure: number;
  flood_exposure: number;
  storm_surge: number;
  infrastructure_vulnerability: number;
  accessibility_risk: number;
  population_criticality: number;
}

export interface ShapFactor {
  factor: string;
  contribution: number;
  description: string;
}

export interface RiskAssessment {
  overall_vulnerability_score: number;
  risk_category: 'Critical' | 'High' | 'Moderate' | 'Low';
  model_version: string;
  data_source: string;
  disclaimer: string;
  cyclone_exposure: number;
  flood_exposure: number;
  storm_surge_exposure: number;
  infrastructure_vulnerability: number;
  accessibility_risk: number;
  population_criticality: number;
  shap_factors: ShapFactor[];
  ai_explanation: string;
  recommended_actions: string[];
}

export const DEFAULT_WEIGHTS: RiskWeights = {
  cyclone_exposure: 0.25,
  flood_exposure: 0.2,
  storm_surge: 0.2,
  infrastructure_vulnerability: 0.15,
  accessibility_risk: 0.1,
  population_criticality: 0.1,
};

export class RiskEngine {
  weights: RiskWeights;

  constructor(weights: RiskWeights = { ...DEFAULT_WEIGHTS }) {
    this.weights = weights;
  }

  setWeights(newWeights: Partial<RiskWeights>) {
    this.weights = { ...this.weights, ...newWeights };
  }

  calculateFloodExposure(rainfallMm: number, elevationM: number, distToCoastKm: number): number {
    const rainComp = Math.min(100.0, (rainfallMm / 400.0) * 100.0);
    const elevFactor = Math.max(0.1, 1.0 - Math.min(elevationM, 25.0) / 25.0);
    const coastFactor = Math.max(0.2, 1.0 - Math.min(distToCoastKm, 30.0) / 30.0);

    const score = rainComp * 0.55 + elevFactor * 100.0 * 0.3 + coastFactor * 100.0 * 0.15;
    return Math.min(100.0, Math.max(5.0, Math.round(score * 10) / 10));
  }

  calculateStormSurgeExposure(surgeM: number, elevationM: number, distToCoastKm: number): number {
    if (distToCoastKm > 25.0) {
      return 5.0;
    }

    const surgeElevDiff = surgeM - elevationM;
    let surgeBase: number;
    if (surgeElevDiff > 2.0) {
      surgeBase = 95.0;
    } else if (surgeElevDiff > 0) {
      surgeBase = 75.0 + (surgeElevDiff / 2.0) * 20.0;
    } else if (surgeElevDiff > -2.0) {
      surgeBase = 40.0 + ((surgeElevDiff + 2.0) / 2.0) * 35.0;
    } else {
      surgeBase = 15.0;
    }

    const coastalDecay = Math.max(0.1, 1.0 - distToCoastKm / 25.0);
    const score = surgeBase * coastalDecay;
    return Math.min(100.0, Math.max(5.0, Math.round(score * 10) / 10));
  }

  calculateAccessibilityRisk(baseAccessibility: number, floodExposure: number, cycloneExposure: number): number {
    const physicalRisk = 100.0 - baseAccessibility;
    const combinedRisk = physicalRisk * 0.35 + floodExposure * 0.4 + cycloneExposure * 0.25;
    return Math.min(100.0, Math.max(5.0, Math.round(combinedRisk * 10) / 10));
  }

  evaluateAsset(
    asset: Record<string, any>,
    cycloneExposure: number,
    rainfallMm: number,
    surgeM: number
  ): RiskAssessment {
    const elev = asset.elevation_m ?? 5.0;
    const distCoast = asset.distance_to_coast_km ?? 10.0;
    const floodExposure = this.calculateFloodExposure(rainfallMm, elev, distCoast);
    const surgeExposure = this.calculateStormSurgeExposure(surgeM, elev, distCoast);

    let infraFragility = (asset.historical_vulnerability ?? 50.0) * 0.5 + (asset.power_dependency ?? 75.0) * 0.3;
    if (asset.backup_power === false) {
      infraFragility = Math.min(100.0, infraFragility + 20.0);
    }

    const accessRisk = this.calculateAccessibilityRisk(
      asset.road_accessibility ?? 80.0,
      floodExposure,
      cycloneExposure
    );

    const popCriticality = asset.population_dependency ?? 70.0;

    const w = this.weights;
    let totalScore =
      cycloneExposure * w.cyclone_exposure +
      floodExposure * w.flood_exposure +
      surgeExposure * w.storm_surge +
      infraFragility * w.infrastructure_vulnerability +
      accessRisk * w.accessibility_risk +
      popCriticality * w.population_criticality;

    totalScore = Math.min(100.0, Math.max(0.0, Math.round(totalScore * 10) / 10));

    let category: 'Critical' | 'High' | 'Moderate' | 'Low';
    if (totalScore >= 81.0) {
      category = 'Critical';
    } else if (totalScore >= 61.0) {
      category = 'High';
    } else if (totalScore >= 31.0) {
      category = 'Moderate';
    } else {
      category = 'Low';
    }

    const shapFactors: ShapFactor[] = [
      {
        factor: 'Cyclone Exposure',
        contribution: Math.round(cycloneExposure * w.cyclone_exposure * 10) / 10,
        description: `High winds & proximity (${cycloneExposure}/100)`,
      },
      {
        factor: 'Flood Inundation Exposure',
        contribution: Math.round(floodExposure * w.flood_exposure * 10) / 10,
        description: `Precipitation & low elevation terrain (${floodExposure}/100)`,
      },
      {
        factor: 'Storm Surge Threat',
        contribution: Math.round(surgeExposure * w.storm_surge * 10) / 10,
        description: `Proximity to coastline & tidal rise (${surgeExposure}/100)`,
      },
      {
        factor: 'Structural & Power Dependency',
        contribution: Math.round(infraFragility * w.infrastructure_vulnerability * 10) / 10,
        description: `Fragility, backup status, & power reliance (${Math.round(infraFragility * 10) / 10}/100)`,
      },
      {
        factor: 'Road Accessibility Risk',
        contribution: Math.round(accessRisk * w.accessibility_risk * 10) / 10,
        description: `Probability of cut-off routes (${Math.round(accessRisk * 10) / 10}/100)`,
      },
      {
        factor: 'Population Criticality',
        contribution: Math.round(popCriticality * w.population_criticality * 10) / 10,
        description: `High catchment dependency & life safety (${Math.round(popCriticality * 10) / 10}/100)`,
      },
    ];

    shapFactors.sort((a, b) => b.contribution - a.contribution);

    const recommendations = this.generateRecommendations(asset, category, floodExposure, surgeExposure, accessRisk);
    const aiExplanation = this.generateRuleExplanation(asset, totalScore, category, shapFactors);

    return {
      overall_vulnerability_score: totalScore,
      risk_category: category,
      model_version: 'Cyclopath-Vulnerability-Surrogate-v1.2',
      data_source: 'Demo Simulation (Synthetic Coastal Dataset)',
      disclaimer:
        'Cyclopath AI Prototype Vulnerability Score. This score represents physical and operational asset vulnerability. It does NOT represent an official IMD cyclone warning or government evacuation order.',
      cyclone_exposure: cycloneExposure,
      flood_exposure: floodExposure,
      storm_surge_exposure: surgeExposure,
      infrastructure_vulnerability: Math.round(infraFragility * 10) / 10,
      accessibility_risk: Math.round(accessRisk * 10) / 10,
      population_criticality: popCriticality,
      shap_factors: shapFactors,
      ai_explanation: aiExplanation,
      recommended_actions: recommendations,
    };
  }

  generateRecommendations(
    asset: Record<string, any>,
    category: string,
    flood: number,
    surge: number,
    accessRisk: number
  ): string[] {
    const assetType = asset.asset_type || 'general';
    const actions: string[] = [];

    if (assetType === 'hospital') {
      actions.push('Verify primary diesel generator fuel reserves (minimum 72-hour autonomous runtime).');
      if (flood > 50.0 || surge > 50.0) {
        actions.push('Relocate ICU backup batteries, neonatal units, and cold-chain pharmacy above ground level.');
      }
      if (accessRisk > 60.0) {
        actions.push('Pre-position amphibious disaster ambulances & establish alternate inland emergency access corridor.');
      }
      actions.push('Notify District Medical Officer and place auxiliary trauma response surgical teams on active standby.');
      actions.push('Pre-position emergency blood reserves and portable water filtration units.');
    } else if (assetType === 'power_station') {
      actions.push('De-energize coastal 33kV and 11kV feeder lines vulnerable to saline storm surge arcing.');
      actions.push('Erect perimeter sandbag dikes around low-lying transformer bays and control switchgear.');
      actions.push('Stage mobile diesel generation units (DG sets) at strategic district junction points.');
      actions.push('Pre-position emergency restoration towers (ERT) and line technician rapid-response squads.');
    } else if (assetType === 'bridge') {
      actions.push('Deploy automated sonar/diver sensors to monitor pier scour and hydrostatic flood pressure.');
      if (accessRisk > 50.0) {
        actions.push('Enforce precautionary heavy transport axle restrictions when sustained wind speeds exceed 90 km/h.');
      }
      actions.push('Establish physical roadblocks and visual strobe markers on bridge approaches.');
      actions.push('Coordinate with Traffic Police to divert arterial logistics onto higher inland bypasses.');
    } else if (assetType === 'school_shelter') {
      actions.push('Verify structural window storm shutters and reinforce roof tie-downs against gale force winds.');
      actions.push('Pre-stock 5 days of dry ration packs, chlorinated drinking water, and ORS kits.');
      actions.push('Inspect solar micro-grid inverter and emergency VHF wireless communication sets.');
      actions.push('Designate dedicated medical isolation room and mother-child care sanitization zone.');
    } else if (assetType === 'water_facility') {
      actions.push('Secure drinking water intake wells with watertight seals against saline storm surge intrusion.');
      actions.push('Pre-stock dry bleaching powder and bulk chlorine gas neutralizing scrubbers.');
      actions.push('Top up elevated storage reservoirs (ESR) to 100% capacity prior to cyclone landfall.');
    } else if (assetType === 'port') {
      actions.push('Order immediate vessel de-berthing and direct ships to anchor in deep sea open waters.');
      actions.push('Lash down dockside container gantry cranes and cease all heavy lift cargo operations.');
      actions.push('Evacuate non-essential marine personnel and secure hazardous chemical storage sheds.');
    } else {
      actions.push('Inspect structural anchor points and clear perimeter debris.');
      actions.push('Pre-position emergency response equipment and coordinate with District Emergency Operation Centre (DEOC).');
    }

    return actions;
  }

  generateRuleExplanation(
    asset: Record<string, any>,
    score: number,
    category: string,
    shapFactors: ShapFactor[]
  ): string {
    const name = asset.name || 'Asset';
    const topDriver = shapFactors[0]?.factor || 'Environmental Exposure';
    const secondDriver = shapFactors[1]?.factor || 'Infrastructure Criticality';

    return (
      `${name} is assessed at ${score}/100 (${category.toUpperCase()} risk). ` +
      `The primary driver is ${topDriver} (+${shapFactors[0]?.contribution ?? 0} pts), ` +
      `compounded by ${secondDriver} (+${shapFactors[1]?.contribution ?? 0} pts). ` +
      `Elevation of ${asset.elevation_m ?? 5}m and coast distance of ${asset.distance_to_coast_km ?? 10}km ` +
      `amplify local exposure.`
    );
  }
}

export const riskEngine = new RiskEngine();
