from fastapi import APIRouter
from ..schemas.schemas import RouteRequest, RouteResponse
from ..services.routing_service import routing_service

router = APIRouter(prefix="/routes", tags=["Routing"])

@router.post("/optimize", response_model=RouteResponse)
def calculate_safe_route(req: RouteRequest):
    """Calculates multi-hazard weighted emergency evacuation and logistics routes avoiding flood and surge sectors."""
    return routing_service.calculate_optimal_route(
        start_lat=req.start_lat,
        start_lng=req.start_lng,
        end_lat=req.end_lat,
        end_lng=req.end_lng,
        avoid_high_flood=req.avoid_high_flood,
        vehicle_type=req.vehicle_type
    )
