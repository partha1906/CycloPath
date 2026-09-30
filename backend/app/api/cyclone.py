from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.cyclone_service import cyclone_service
from ..schemas.schemas import CycloneResponse

router = APIRouter(prefix="/cyclones", tags=["Cyclones"])

@router.get("", response_model=List[CycloneResponse])
def get_cyclones():
    """Returns list of active and simulated cyclones."""
    samudra = cyclone_service.get_default_cyclone_samudra()
    return [samudra]

@router.get("/{cyclone_id}", response_model=CycloneResponse)
def get_cyclone_by_id(cyclone_id: int):
    """Returns detailed cyclone track, central pressure, wind field, and cone coordinates."""
    samudra = cyclone_service.get_default_cyclone_samudra()
    if cyclone_id != samudra["id"] and cyclone_id != 1:
        raise HTTPException(status_code=404, detail="Cyclone scenario not found")
    return samudra
