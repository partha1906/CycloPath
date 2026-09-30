from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional, Dict, Any
from ..schemas.schemas import AlertResponse
from ..services.alert_service import alert_service
from .auth import require_responder_or_admin_role

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, WARNING, INFO"),
    district: Optional[str] = Query(None, description="Filter by district")
):
    """Retrieves live simulated hazard alerts."""
    return alert_service.get_all_alerts(severity=severity, district=district)

@router.post("/{alert_id}/ack")
def acknowledge_alert(
    alert_id: int,
    user: Dict[str, Any] = Depends(require_responder_or_admin_role)
):
    """Marks an emergency alert as acknowledged by verified incident command personnel."""
    success = alert_service.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert ID not found")
    return {
        "status": "acknowledged", 
        "alert_id": alert_id,
        "acknowledged_by": user.get("sub", "command_staff"),
        "role": user.get("role")
    }
