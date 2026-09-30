import { cycloneService, CycloneData } from './cycloneService';
import { routingService } from './routingService';
import { geminiService } from './geminiService';
import { SEED_ASSETS } from '../data/seedData';
import { riskEngine } from './riskEngine';

export interface AgentToolCallTrace {
  tool_name: string;
  arguments: Record<string, any>;
  result_summary: string;
}

export interface AgentPriorityAsset {
  rank: number;
  asset_id: string;
  name: string;
  type: string;
  risk_score: number;
  risk_category: string;
  primary_threat: string;
  recommended_first_step: string;
}

export interface AgentResponsePlan {
  query: string;
  language: string;
  situation_summary: string;
  top_priorities: AgentPriorityAsset[];
  recommended_actions: string[];
  evacuation_considerations: string[];
  resource_allocation: Array<{ resource: string; allocation: string; location: string }>;
  citizen_communication_draft: string;
  tool_calls: AgentToolCallTrace[];
  disclaimer: string;
}

export class CyclopathResponseAgent {
  name = 'Cyclopath Response Agent';

  executeTool(
    toolName: string,
    args: Record<string, any>,
    context: { assets?: any[]; cyclone?: CycloneData }
  ): [Record<string, any>, string] {
    const assets: any[] = context.assets || [];
    const cyclone = context.cyclone || cycloneService.getDefaultCycloneSamudra();

    if (toolName === 'get_cyclone_status') {
      const summary =
        `${cyclone.name} (${cyclone.category}): Winds ${cyclone.max_wind_speed_kmh} km/h, ` +
        `Pressure ${cyclone.central_pressure_hpa} hPa, Movement ${cyclone.movement_direction} at ${cyclone.movement_speed_kmh} km/h. ` +
        `Landfall estimated: ${cyclone.estimated_landfall_location} (${cyclone.estimated_landfall_time}).`;
      return [{ cyclone }, summary];
    } else if (toolName === 'get_infrastructure_risk') {
      const district = args.district;
      const assetType = args.asset_type;
      let filtered = assets;
      if (district) {
        filtered = filtered.filter((a) => (a.district || '').toLowerCase() === district.toLowerCase());
      }
      if (assetType) {
        filtered = filtered.filter((a) => (a.asset_type || '').toLowerCase() === assetType.toLowerCase());
      }
      const ranked = [...filtered].sort(
        (a, b) =>
          (b.risk_assessment?.overall_vulnerability_score || 0) -
          (a.risk_assessment?.overall_vulnerability_score || 0)
      );
      const topItems = ranked.slice(0, 5);
      const summary = `Identified ${topItems.length} priority assets. Highest risk: ${topItems[0]?.name || 'None'} (${topItems[0]?.risk_assessment?.overall_vulnerability_score || 0}/100).`;
      return [{ ranked_assets: topItems, total_matched: filtered.length }, summary];
    } else if (toolName === 'get_nearby_hospitals') {
      const district = args.district || 'Puri';
      const hospitals = assets.filter(
        (a) => a.asset_type === 'hospital' && (!district || (a.district || '').toLowerCase() === district.toLowerCase())
      );
      hospitals.sort(
        (a, b) =>
          (b.risk_assessment?.overall_vulnerability_score || 0) -
          (a.risk_assessment?.overall_vulnerability_score || 0)
      );
      const summary = `Located ${hospitals.length} hospitals in ${district}. Most vulnerable: ${hospitals[0]?.name || 'N/A'} (Score: ${hospitals[0]?.risk_assessment?.overall_vulnerability_score || 0}).`;
      return [{ hospitals }, summary];
    } else if (toolName === 'get_nearby_shelters') {
      const district = args.district || 'Puri';
      const shelters = assets.filter(
        (a) => a.asset_type === 'school_shelter' && (!district || (a.district || '').toLowerCase() === district.toLowerCase())
      );
      const totalCap = shelters.reduce((acc, curr) => acc + (curr.capacity || 1000), 0);
      const summary = `Found ${shelters.length} shelters in ${district} with total intake capacity of ${totalCap.toLocaleString()} persons.`;
      return [{ shelters, total_capacity: totalCap }, summary];
    } else if (toolName === 'get_flood_risk') {
      const coastalAssets = assets.filter(
        (a) => (a.distance_to_coast_km ?? 99) <= 15.0 && (a.elevation_m ?? 99) <= 6.0
      );
      const summary = `${coastalAssets.length} critical infrastructure assets situated in low-elevation coastal flood/surge plains (<6m elevation, <15km coast).`;
      return [{ high_flood_assets: coastalAssets }, summary];
    } else if (toolName === 'get_population_exposure') {
      const district = args.district || 'Puri';
      const popEstimates: Record<string, number> = {
        Puri: 1698000,
        Jagatsinghpur: 1136000,
        Kendrapara: 1440000,
        Balasore: 2320000,
        Khurda: 2465000,
        Bhubaneswar: 1100000,
      };
      const pop = popEstimates[district] || 1200000;
      const exposed = Math.floor(pop * 0.42);
      const evacTarget = Math.floor(exposed * 0.28);
      const summary = `District ${district}: Estimated population exposed to cyclone/surge ~${exposed.toLocaleString()} residents; priority evacuation target: ~${evacTarget.toLocaleString()}.`;
      return [{ district, exposed_population: exposed, priority_evac_target: evacTarget }, summary];
    } else if (toolName === 'calculate_route') {
      const routeResp = routingService.calculateOptimalRoute(
        args.start_lat || 19.821,
        args.start_lng || 85.845,
        args.end_lat || 20.2312,
        args.end_lng || 85.778,
        true
      );
      const summary = `Calculated safest corridor (${routeResp.route_name}): Distance ${routeResp.distance_km} km, est. travel time ${routeResp.estimated_travel_time_min} mins, Risk: ${routeResp.risk_level}.`;
      return [routeResp, summary];
    }

    return [{}, `Tool ${toolName} executed.`];
  }

  async analyzeAndPlan(
    query: string,
    district?: string,
    _assetId?: string,
    language = 'en',
    context?: { assets?: any[]; cyclone?: CycloneData }
  ): Promise<AgentResponsePlan> {
    const cyclone = context?.cyclone || cycloneService.getDefaultCycloneSamudra();
    const assets = (context?.assets && context.assets.length > 0)
      ? context.assets
      : SEED_ASSETS.map((raw: any) => {
          const a = { ...raw };
          const [distKm, cycloneExp] = cycloneService.calculateCycloneExposure(
            a.latitude,
            a.longitude,
            cyclone.current_lat,
            cyclone.current_lng,
            cyclone.max_wind_speed_kmh
          );
          const ra = riskEngine.evaluateAsset(
            a,
            cycloneExp,
            cyclone.rainfall_24h_mm,
            cyclone.storm_surge_potential_m
          );
          a.distance_to_cyclone_km = Math.round(distKm * 10) / 10;
          a.risk_assessment = ra;
          return a;
        });

    const ctx = {
      cyclone,
      assets,
    };
    const targetDistrict = district || 'Puri';

    const toolTraces: AgentToolCallTrace[] = [];

    // 1. Cyclone status
    const [, sum1] = this.executeTool('get_cyclone_status', {}, ctx);
    toolTraces.push({ tool_name: 'get_cyclone_status', arguments: {}, result_summary: sum1 });

    // 2. High risk infrastructure
    const [res2, sum2] = this.executeTool('get_infrastructure_risk', { district: targetDistrict }, ctx);
    toolTraces.push({ tool_name: 'get_infrastructure_risk', arguments: { district: targetDistrict }, result_summary: sum2 });

    // 3. Hospitals
    const [, sum3] = this.executeTool('get_nearby_hospitals', { district: targetDistrict }, ctx);
    toolTraces.push({ tool_name: 'get_nearby_hospitals', arguments: { district: targetDistrict }, result_summary: sum3 });

    // 4. Shelters
    const [res4, sum4] = this.executeTool('get_nearby_shelters', { district: targetDistrict }, ctx);
    toolTraces.push({ tool_name: 'get_nearby_shelters', arguments: { district: targetDistrict }, result_summary: sum4 });

    // 5. Population exposure
    const [res5, sum5] = this.executeTool('get_population_exposure', { district: targetDistrict }, ctx);
    toolTraces.push({ tool_name: 'get_population_exposure', arguments: { district: targetDistrict }, result_summary: sum5 });

    // Top Priority Assets
    const priorityAssetsRaw = res2.ranked_assets || [];
    const topPriorities: AgentPriorityAsset[] = priorityAssetsRaw.slice(0, 4).map((item: any, idx: number) => {
      const ra = item.risk_assessment || {};
      const firstFactor = ra.shap_factors?.[0];
      const threatDesc = firstFactor?.description || 'High wind & flood exposure';

      return {
        rank: idx + 1,
        asset_id: item.asset_id,
        name: item.name,
        type: item.asset_type,
        risk_score: ra.overall_vulnerability_score || 85.0,
        risk_category: ra.risk_category || 'Critical',
        primary_threat: threatDesc,
        recommended_first_step: ra.recommended_actions?.[0] || 'Activate emergency protocol',
      };
    });

    const recommendedActions = [
      `Direct Hospital Emergency Command at ${topPriorities[0]?.name || 'District Hospital'} to test auxiliary DG fuel supplies and migrate critical life-support apparatus above Level 1.`,
      'Pre-deploy 4 amphibious response ambulances along the inland bypass corridor (NH-316) to bypass vulnerable coastal roads.',
      'De-energize coastal 33kV distribution feeders in low-lying maritime belts 3 hours prior to landfall to prevent saline flashover fire hazards.',
      `Commence phased evacuation of approximately ${(res5.priority_evac_target || 95000).toLocaleString()} vulnerable citizens into ${(res4.shelters?.length || 12)} designated storm shelters.`,
      'Position State Disaster Rapid Action Force (ODRAF / NDRF) search & rescue teams with high-discharge dewatering pumps at district headquarters.',
    ];

    const evacuationConsiderations = [
      'Priority 1 Zone: Coastal villages within 5 km of shoreline and under 4m elevation (Puri Town, Astaranga, Kakatpur).',
      `Evacuation Window: Complete all transit before T-4 hours (${cyclone.estimated_landfall_time || 'T-4 hours'}), when sustained winds exceed 65 km/h.`,
      'Special Attention: 1,420 inpatient bed transfers and 3,100 elderly/mobility-impaired persons requiring specialized transport.',
    ];

    const resourceAllocation = [
      { resource: 'NDRF / ODRAF Rescue Battalions', allocation: '6 Teams (240 personnel)', location: 'Puri Sadar & Konark' },
      { resource: 'Mobile Dewatering Pumps (500 GPM)', allocation: '14 Units', location: 'District Hospital & Low-lying Substation' },
      { resource: 'Emergency Diesel Generators (125 kVA)', allocation: '8 Units', location: 'Designated Primary Cyclone Shelters' },
      { resource: 'Emergency Rations & Water Pouches', allocation: '120,000 Packs', location: 'Civil Supplies Central Warehouse Pipli' },
    ];

    const citizenAlert = geminiService.generateMultilingualCitizenAlert(
      targetDistrict,
      'CRITICAL',
      cyclone.name || 'Cyclone Samudra',
      language
    );

    const baseSituation =
      `Severe Cyclonic Storm ${cyclone.name} is tracking ${cyclone.movement_direction} with peak gusts of ${cyclone.max_wind_speed_kmh} km/h. ` +
      `Landfall threat window active for ${cyclone.estimated_landfall_location}. ` +
      `In ${targetDistrict} District, ${topPriorities.length} key infrastructure facilities have breached critical vulnerability thresholds. ` +
      `High storm surge risk (up to ${cyclone.storm_surge_potential_m}m) and extreme precipitation (${cyclone.rainfall_24h_mm}mm) ` +
      `demand immediate defensive positioning and selective evacuation.`;

    let situationSummary = baseSituation;
    try {
      const grounding = `${baseSituation}\nIdentified ${topPriorities.length} vulnerable nodes. Top priority: ${topPriorities[0]?.name || 'District Hospital'}.`;
      const aiSynthesis = await geminiService.generateAgentSynthesis(query, grounding, language);
      if (aiSynthesis) {
        situationSummary = aiSynthesis;
      }
    } catch (e) {
      console.warn('Gemini dynamic synthesis error:', e);
    }

    return {
      query,
      language,
      situation_summary: situationSummary,
      top_priorities: topPriorities,
      recommended_actions: recommendedActions,
      evacuation_considerations: evacuationConsiderations,
      resource_allocation: resourceAllocation,
      citizen_communication_draft: citizenAlert,
      tool_calls: toolTraces,
      disclaimer: 'Decision-support AI guidance powered by Google Gemini. Validate with official IMD and State Disaster Management Authorities.',
    };
  }
}

export const agentService = new CyclopathResponseAgent();
