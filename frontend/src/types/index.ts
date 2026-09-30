export type RiskCategory = 'Critical' | 'High' | 'Moderate' | 'Low';

export type AssetType = 
  | 'hospital' 
  | 'power_station' 
  | 'bridge' 
  | 'road' 
  | 'school_shelter' 
  | 'water_facility' 
  | 'port';

export type UserRole = 
  | 'Disaster_Authority' 
  | 'Municipal_Officer' 
  | 'First_Responder' 
  | 'Public_Citizen';

export interface ShapFactor {
  factor: string;
  contribution: number;
  description: string;
}

export interface RiskAssessment {
  overall_vulnerability_score: number;
  risk_category: RiskCategory;
  cyclone_exposure: number;
  flood_exposure: number;
  storm_surge_exposure: number;
  infrastructure_vulnerability: number;
  accessibility_risk: number;
  population_criticality: number;
  shap_factors: ShapFactor[];
  ai_explanation: string;
  recommended_actions: string[];
  model_version?: string;
  data_source?: string;
  disclaimer?: string;
}

export interface MLPrediction {
  ml_predicted_score: number;
  risk_category: RiskCategory;
  priority_level: number;
  feature_attributions: Array<{
    feature: string;
    importance_pct: number;
    marginal_impact: number;
  }>;
  model_metadata: {
    model_name: string;
    algorithm: string;
    dataset_origin: string;
    training_samples: number;
    validation_r2: number;
    mae: number;
    version: string;
  };
}

export interface InfrastructureAsset {
  id: number;
  asset_id: string;
  name: string;
  asset_type: AssetType;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  importance: 'critical' | 'high' | 'moderate' | 'standard';
  capacity: number;
  construction_type: string;
  elevation_m: number;
  distance_to_coast_km: number;
  distance_to_cyclone_km: number;
  backup_power: boolean;
  power_dependency: number;
  road_accessibility: number;
  population_dependency: number;
  historical_vulnerability: number;
  status: string;
  notes?: string;
  risk_assessment: RiskAssessment;
  ml_prediction?: MLPrediction;
}

export interface CyclonePoint {
  time: string;
  lat: number;
  lng: number;
  wind_kmh: number;
  intensity: string;
  pressure_hpa: number;
}

export interface Cyclone {
  id: number;
  name: string;
  cyclone_code: string;
  category: string;
  status: string;
  current_lat: number;
  current_lng: number;
  max_wind_speed_kmh: number;
  central_pressure_hpa: number;
  movement_speed_kmh: number;
  movement_direction: string;
  estimated_landfall_time: string;
  estimated_landfall_location: string;
  storm_surge_potential_m: number;
  rainfall_24h_mm: number;
  official_imd_bulletin_stage?: string;
  trajectory_points: CyclonePoint[];
  cone_coordinates: number[][];
}

export interface RiskSummary {
  total_monitored: number;
  critical_assets: number;
  high_risk_assets: number;
  moderate_risk_assets: number;
  low_risk_assets: number;
  hospitals_at_risk: number;
  power_stations_at_risk: number;
  bridges_at_risk: number;
  roads_at_risk: number;
  shelters_active: number;
  estimated_affected_population: number;
  evacuation_priority_zones: string[];
  category_distribution: Array<{ name: string; count: number; fill: string }>;
  district_breakdown: Array<{
    district: string;
    state: string;
    total_assets: number;
    critical_assets: number;
    high_risk_assets: number;
    avg_vulnerability_score: number;
  }>;
}

export interface SimulationRequest {
  wind_speed_kmh: number;
  rainfall_mm: number;
  storm_surge_m: number;
  path_shift_km?: number;
}

export interface SimulationResult {
  simulation_id: number;
  name: string;
  scenario_wind_kmh: number;
  scenario_rain_mm: number;
  scenario_surge_m: number;
  critical_assets_count: number;
  high_risk_assets_count: number;
  population_affected_est: number;
  baseline_critical_count: number;
  critical_increase_pct: number;
  top_affected_districts: Array<{ district: string; affected_assets: number }>;
  newly_critical_assets: Array<{
    asset_id: string;
    name: string;
    type: string;
    district: string;
    old_score: number;
    new_score: number;
    score_jump: number;
  }>;
  disclaimer: string;
}

export interface AgentResponsePlan {
  query: string;
  language: string;
  situation_summary: string;
  top_priorities: Array<{
    rank: number;
    asset_id: string;
    name: string;
    type: string;
    risk_score: number;
    risk_category: string;
    primary_threat: string;
    recommended_first_step: string;
  }>;
  recommended_actions: string[];
  evacuation_considerations: string[];
  resource_allocation: Array<{ resource: string; allocation: string; location: string }>;
  citizen_communication_draft: string;
  tool_calls: Array<{
    tool_name: string;
    arguments: Record<string, any>;
    result_summary: string;
  }>;
  disclaimer: string;
}

export interface Alert {
  id: number;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  category: string;
  district: string;
  asset_name?: string;
  message: string;
  recommended_action: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface RouteResponse {
  route_name: string;
  distance_km: number;
  estimated_travel_time_min: number;
  risk_level: string;
  flood_exposure_index: number;
  path: Array<{ lat: number; lng: number }>;
  waypoints: string[];
  alternate_route_available: boolean;
  alternate_path?: Array<{ lat: number; lng: number }>;
  safety_notes: string[];
}

export interface MultimodalAnalysis {
  asset_id?: string;
  structural_integrity_concern: string;
  visible_flooding: string;
  road_accessibility_status: string;
  damage_indicators: string[];
  inspection_priority: string;
  reasoning: string;
  confidence: number;
  disclaimer: string;
}

export interface SystemHealth {
  status: string;
  backend: string;
  database: string;
  ai_engine: string;
  map_engine: string;
  ml_service: string;
  data_pipeline: string;
  active_scenario: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface DataSource {
  id: number;
  name: string;
  provider: string;
  data_type: string;
  update_frequency: string;
  status: string;
  url: string;
  description: string;
}
