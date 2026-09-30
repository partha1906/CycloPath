from fastapi import APIRouter
from typing import Dict, Any
from .infrastructure import get_all_assets_evaluated
from ..services.cyclone_service import cyclone_service
from ..services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/latest")
def get_latest_report() -> Dict[str, Any]:
    """Generates the latest emergency infrastructure assessment report based on current cyclone conditions."""
    assets = get_all_assets_evaluated()
    cyclone = cyclone_service.get_default_cyclone_samudra()
    
    critical_assets = [a for a in assets if a["risk_assessment"]["risk_category"] == "Critical"]
    high_assets = [a for a in assets if a["risk_assessment"]["risk_category"] == "High"]
    
    # Sort critical by score
    critical_assets.sort(key=lambda x: x["risk_assessment"]["overall_vulnerability_score"], reverse=True)
    
    return report_service.generate_assessment_report(
        cyclone=cyclone,
        assets=assets,
        critical_count=len(critical_assets),
        high_risk_count=len(high_assets),
        total_assets=len(assets),
        top_priorities=critical_assets
    )
