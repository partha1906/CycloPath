from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RiskWeightsSchema(BaseModel):
    cyclone_exposure: float = 0.25
    flood_exposure: float = 0.20
    storm_surge: float = 0.20
    infrastructure_vulnerability: float = 0.15
    accessibility_risk: float = 0.10
    population_criticality: float = 0.10

class AssetBase(BaseModel):
    asset_id: str
    name: str
    asset_type: str
    latitude: float
    longitude: float
    district: str
    state: str
    importance: str = "high"
    capacity: int = 500
    construction_type: str = "reinforced_concrete"
    elevation_m: float = 5.0
    distance_to_coast_km: float = 10.0
    backup_power: bool = True
    power_dependency: float = 80.0
    road_accessibility: float = 80.0
    population_dependency: float = 75.0
    historical_vulnerability: float = 60.0
    status: str = "operational"
    notes: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ShapFactor(BaseModel):
    factor: str
    contribution: float
    description: str

class RiskAssessmentResponse(BaseModel):
    id: int
    asset_id: int
    asset_code: str
    asset_name: str
    asset_type: str
    district: str
    latitude: float
    longitude: float
    
    cyclone_exposure: float
    flood_exposure: float
    storm_surge_exposure: float
    infrastructure_vulnerability: float
    accessibility_risk: float
    population_criticality: float
    
    overall_vulnerability_score: float
    risk_category: str
    priority_rank: int
    model_version: str = "Cyclopath-Vulnerability-Surrogate-v1.2"
    data_source: str = "Demo Simulation (Synthetic Coastal Dataset)"
    disclaimer: str = "Cyclopath AI Prototype Vulnerability Score. This score represents physical and operational asset vulnerability. It does NOT represent an official IMD cyclone warning or government evacuation order."
    
    shap_factors: List[ShapFactor] = []
    ai_explanation: str
    recommended_actions: List[str] = []
    calculated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CyclonePoint(BaseModel):
    time: str
    lat: float
    lng: float
    wind_kmh: float
    intensity: str
    pressure_hpa: float = 960.0

class CycloneResponse(BaseModel):
    id: int
    name: str
    cyclone_code: str
    category: str
    status: str
    current_lat: float
    current_lng: float
    max_wind_speed_kmh: float
    central_pressure_hpa: float
    movement_speed_kmh: float
    movement_direction: str
    estimated_landfall_time: str
    estimated_landfall_location: str
    storm_surge_potential_m: float
    rainfall_24h_mm: float
    official_imd_bulletin_stage: Optional[str] = None
    trajectory_points: List[CyclonePoint] = []
    cone_coordinates: List[List[float]] = []

    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    cyclone_id: Optional[int] = None
    wind_speed_kmh: float = Field(..., ge=60, le=320)
    rainfall_mm: float = Field(..., ge=0, le=800)
    storm_surge_m: float = Field(..., ge=0, le=12)
    path_shift_km: float = Field(0.0, ge=-200, le=200)

class SimulationComparisonMetric(BaseModel):
    baseline: float
    scenario: float
    delta_percent: float

class SimulationResult(BaseModel):
    simulation_id: int
    name: str
    scenario_wind_kmh: float
    scenario_rain_mm: float
    scenario_surge_m: float
    critical_assets_count: int
    high_risk_assets_count: int
    population_affected_est: int
    baseline_critical_count: int
    critical_increase_pct: float
    top_affected_districts: List[Dict[str, Any]]
    newly_critical_assets: List[Dict[str, Any]]
    disclaimer: str = "Cyclopath AI Prototype Scenario Simulation - Not an official IMD evacuation order"

class AgentQueryRequest(BaseModel):
    query: str
    district: Optional[str] = None
    asset_id: Optional[str] = None
    language: str = "en"  # en, hi, mr

class AgentToolCallTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str

class AgentResponsePlan(BaseModel):
    query: str
    language: str
    situation_summary: str
    top_priorities: List[Dict[str, Any]]
    recommended_actions: List[str]
    evacuation_considerations: List[str]
    resource_allocation: List[Dict[str, str]]
    citizen_communication_draft: str
    tool_calls: List[AgentToolCallTrace] = []
    disclaimer: str = "Decision-support AI guidance. Validate with official IMD and State Disaster Management Authorities."

class MultimodalAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    asset_id: Optional[str] = None
    context_notes: Optional[str] = None

class MultimodalAnalysisResponse(BaseModel):
    asset_id: Optional[str]
    structural_integrity_concern: str  # Critical, Elevated, Moderate, Low
    visible_flooding: str
    road_accessibility_status: str
    damage_indicators: List[str]
    inspection_priority: str
    reasoning: str
    confidence: float
    disclaimer: str = "Preliminary multimodal visual screening. Mandatory professional on-site structural engineering inspection required."

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    avoid_high_flood: bool = True
    vehicle_type: str = "ambulance"  # ambulance, heavy_truck, response_suv

class RouteCoordinate(BaseModel):
    lat: float
    lng: float

class RouteResponse(BaseModel):
    route_name: str
    distance_km: float
    estimated_travel_time_min: float
    risk_level: str  # SAFE, CAUTION, HIGH_RISK
    flood_exposure_index: float
    path: List[RouteCoordinate]
    waypoints: List[str]
    alternate_route_available: bool
    alternate_path: Optional[List[RouteCoordinate]] = None
    safety_notes: List[str]

class AlertResponse(BaseModel):
    id: int
    title: str
    severity: str
    category: str
    district: str
    asset_name: Optional[str]
    message: str
    recommended_action: str
    timestamp: datetime
    acknowledged: bool

    class Config:
        from_attributes = True

class DataSourceResponse(BaseModel):
    id: int
    name: str
    provider: str
    data_type: str
    update_frequency: str
    status: str
    url: Optional[str]
    description: Optional[str]
    last_updated: datetime

    class Config:
        from_attributes = True

class SystemHealthResponse(BaseModel):
    status: str
    backend: str
    database: str
    ai_engine: str
    map_engine: str
    ml_service: str
    data_pipeline: str
    active_scenario: str
    uptime_seconds: float
    timestamp: datetime
