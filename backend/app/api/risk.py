from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Dict, Any, List, Optional
from .infrastructure import get_all_assets_evaluated
from ..core.config import settings, RiskWeights
from ..schemas.schemas import RiskWeightsSchema
from ..services.risk_engine import risk_engine
from .auth import require_admin_role

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/summary")
def get_risk_summary() -> Dict[str, Any]:
    """Returns high-level vulnerability metrics and category breakdowns for the command center dashboard."""
    assets = get_all_assets_evaluated()
    
    total = len(assets)
    critical_count = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Critical")
    high_count = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "High")
    moderate_count = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Moderate")
    low_count = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Low")
    
    hospitals_risk = sum(1 for a in assets if a["asset_type"] == "hospital" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
    power_risk = sum(1 for a in assets if a["asset_type"] == "power_station" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
    bridges_risk = sum(1 for a in assets if a["asset_type"] == "bridge" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
    roads_risk = sum(1 for a in assets if a["asset_type"] == "road" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
    shelters_count = sum(1 for a in assets if a["asset_type"] == "school_shelter")
    
    # District risk aggregation
    district_map: Dict[str, Dict[str, Any]] = {}
    for a in assets:
        d = a["district"]
        if d not in district_map:
            district_map[d] = {"district": d, "state": a["state"], "total": 0, "critical": 0, "high": 0, "scores": []}
        district_map[d]["total"] += 1
        score = a["risk_assessment"]["overall_vulnerability_score"]
        district_map[d]["scores"].append(score)
        if a["risk_assessment"]["risk_category"] == "Critical":
            district_map[d]["critical"] += 1
        elif a["risk_assessment"]["risk_category"] == "High":
            district_map[d]["high"] += 1

    district_breakdown = []
    for d, info in district_map.items():
        avg_score = round(sum(info["scores"]) / len(info["scores"]), 1) if info["scores"] else 0
        district_breakdown.append({
            "district": d,
            "state": info["state"],
            "total_assets": info["total"],
            "critical_assets": info["critical"],
            "high_risk_assets": info["high"],
            "avg_vulnerability_score": avg_score
        })
    district_breakdown.sort(key=lambda x: x["avg_vulnerability_score"], reverse=True)

    return {
        "total_monitored": total,
        "critical_assets": critical_count,
        "high_risk_assets": high_count,
        "moderate_risk_assets": moderate_count,
        "low_risk_assets": low_count,
        "hospitals_at_risk": hospitals_risk,
        "power_stations_at_risk": power_risk,
        "bridges_at_risk": bridges_risk,
        "roads_at_risk": roads_risk,
        "shelters_active": shelters_count,
        "estimated_affected_population": 485000,
        "evacuation_priority_zones": ["Puri Coastal Block", "Paradip Industrial Rim", "Astaranga Delta", "Erasama Sector"],
        "category_distribution": [
            {"name": "Critical (>80)", "count": critical_count, "fill": "#ef4444"},
            {"name": "High (61-80)", "count": high_count, "fill": "#f97316"},
            {"name": "Moderate (31-60)", "count": moderate_count, "fill": "#eab308"},
            {"name": "Low (0-30)", "count": low_count, "fill": "#22c55e"}
        ],
        "district_breakdown": district_breakdown
    }

@router.get("/weights", response_model=RiskWeightsSchema)
def get_risk_weights():
    """Returns the current configurable multi-factor risk weights."""
    return risk_engine.weights

@router.post("/weights", response_model=RiskWeightsSchema)
def update_risk_weights(
    new_weights: RiskWeightsSchema,
    user: Dict[str, Any] = Depends(require_admin_role)
):
    """Allows authenticated administrators to dynamically rebalance risk engine weightings."""
    weights = RiskWeights(**new_weights.model_dump())
    risk_engine.set_weights(weights)
    return risk_engine.weights

@router.get("/heatmap")
def get_vulnerability_heatmap():
    """Returns geospatial coordinate array with risk weighting for Leaflet heatmap visualizer."""
    assets = get_all_assets_evaluated()
    points = []
    for a in assets:
        score = a["risk_assessment"]["overall_vulnerability_score"]
        points.append([a["latitude"], a["longitude"], round(score / 100.0, 2)])
    return {"points": points}
