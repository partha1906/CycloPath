from fastapi import APIRouter
from typing import Dict, Any
from ..schemas.schemas import AgentQueryRequest, AgentResponsePlan
from ..services.agent_service import agent_service
from ..services.cyclone_service import cyclone_service
from .infrastructure import get_all_assets_evaluated

router = APIRouter(prefix="/agent", tags=["AI Response Agent"])

@router.post("/query", response_model=AgentResponsePlan)
def query_agent(req: AgentQueryRequest):
    """Processes natural language queries or emergency preparedness requests using deterministic tool-calling synthesis."""
    assets = get_all_assets_evaluated()
    cyclone = cyclone_service.get_default_cyclone_samudra()
    
    context = {
        "assets": assets,
        "cyclone": cyclone
    }
    
    plan = agent_service.analyze_and_plan(
        query=req.query,
        district=req.district,
        asset_id=req.asset_id,
        language=req.language,
        context=context
    )
    return plan
