from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from ..data.seed_data import SEED_ASSETS
from ..services.cyclone_service import cyclone_service
from ..services.risk_engine import risk_engine
from ..services.ml_service import ml_service
from ..schemas.schemas import AssetResponse, RiskAssessmentResponse

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])

# In-memory store initialized from seed data
ASSETS_DB: List[Dict[str, Any]] = []

def init_assets_db():
    global ASSETS_DB
    if not ASSETS_DB:
        cyclone = cyclone_service.get_default_cyclone_samudra()
        for idx, raw in enumerate(SEED_ASSETS, 1):
            asset = dict(raw)
            asset["id"] = idx
            
            # Compute real-time hazard exposure
            dist_km, cyclone_exposure = cyclone_service.calculate_cyclone_exposure(
                asset["latitude"],
                asset["longitude"],
                cyclone["current_lat"],
                cyclone["current_lng"],
                cyclone["max_wind_speed_kmh"]
            )
            
            # Risk Engine calculation
            eval_res = risk_engine.evaluate_asset(
                asset,
                cyclone_exposure,
                cyclone["rainfall_24h_mm"],
                cyclone["storm_surge_potential_m"]
            )
            
            # ML Model inference
            ml_pred = ml_service.predict_asset_vulnerability(
                asset,
                cyclone["max_wind_speed_kmh"],
                cyclone["rainfall_24h_mm"],
                dist_km,
                cyclone["storm_surge_potential_m"]
            )
            
            asset["distance_to_cyclone_km"] = round(dist_km, 1)
            asset["risk_assessment"] = eval_res
            asset["ml_prediction"] = ml_pred
            ASSETS_DB.append(asset)

init_assets_db()

def get_all_assets_evaluated(
    wind_kmh: Optional[float] = None,
    rain_mm: Optional[float] = None,
    surge_m: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Helper to recalculate assets under scenario conditions."""
    cyclone = cyclone_service.get_default_cyclone_samudra()
    effective_wind = wind_kmh if wind_kmh is not None else cyclone["max_wind_speed_kmh"]
    effective_rain = rain_mm if rain_mm is not None else cyclone["rainfall_24h_mm"]
    effective_surge = surge_m if surge_m is not None else cyclone["storm_surge_potential_m"]
    
    results = []
    for raw in ASSETS_DB:
        asset = dict(raw)
        dist_km, cyclone_exp = cyclone_service.calculate_cyclone_exposure(
            asset["latitude"],
            asset["longitude"],
            cyclone["current_lat"],
            cyclone["current_lng"],
            effective_wind
        )
        eval_res = risk_engine.evaluate_asset(asset, cyclone_exp, effective_rain, effective_surge)
        ml_pred = ml_service.predict_asset_vulnerability(asset, effective_wind, effective_rain, dist_km, effective_surge)
        
        asset["distance_to_cyclone_km"] = round(dist_km, 1)
        asset["risk_assessment"] = eval_res
        asset["ml_prediction"] = ml_pred
        results.append(asset)
    return results

@router.get("")
def list_infrastructure(
    asset_type: Optional[str] = Query(None, description="Filter by type: hospital, power_station, bridge, road, school_shelter, water_facility, port"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    risk_category: Optional[str] = Query(None, description="Filter by category: Critical, High, Moderate, Low"),
    search: Optional[str] = Query(None, description="Search by name or asset ID")
):
    """Lists infrastructure assets with multi-hazard vulnerability evaluations."""
    assets = get_all_assets_evaluated()
    
    if asset_type:
        assets = [a for a in assets if a["asset_type"].lower() == asset_type.lower()]
    if district:
        assets = [a for a in assets if district.lower() in a["district"].lower()]
    if risk_category:
        assets = [a for a in assets if a["risk_assessment"]["risk_category"].lower() == risk_category.lower()]
    if search:
        s = search.lower()
        assets = [a for a in assets if s in a["name"].lower() or s in a["asset_id"].lower() or s in a["district"].lower()]
        
    return assets

@router.get("/{asset_id}")
def get_asset_detail(asset_id: str):
    """Returns detailed assessment, SHAP attribution, and recommendations for a single infrastructure asset."""
    assets = get_all_assets_evaluated()
    for a in assets:
        if str(a["id"]) == asset_id or a["asset_id"].lower() == asset_id.lower():
            return a
    raise HTTPException(status_code=404, detail="Infrastructure asset not found")
