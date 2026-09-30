from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..core.security import (
    authenticate_user, 
    issue_token_for_user, 
    verify_token, 
    DEMO_USERS, 
    ROLE_ALIASES
)
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RoleSwitchRequest(BaseModel):
    role: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str
    title: str
    agency: str

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency that cryptographically verifies the JWT token from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authentication credentials. Expected 'Authorization: Bearer <token>' header."
        )
    
    token = authorization.split("Bearer ", 1)[1].strip()
    try:
        payload = verify_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
        
    return payload

def require_admin_role(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Enforces that the authenticated user possesses an administrative role."""
    role = user.get("role", "")
    if role not in ("Disaster Management Authority", "Municipal Officer"):
        raise HTTPException(
            status_code=403, 
            detail=f"Access forbidden: Administrative clearance required. Current role '{role}' is not authorized."
        )
    return user

def require_responder_or_admin_role(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Enforces that the authenticated user possesses operational command clearance."""
    role = user.get("role", "")
    if role not in ("Disaster Management Authority", "Municipal Officer", "Emergency Responder"):
        raise HTTPException(
            status_code=403, 
            detail=f"Access forbidden: Operational command clearance required. Public accounts cannot acknowledge alerts."
        )
    return user

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """Authenticates credentials against verified command and citizen accounts, returning a signed JWT."""
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = issue_token_for_user(user)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        role=user["role"],
        title=user["title"],
        agency=user["agency"]
    )

@router.post("/demo-token", response_model=AuthResponse)
def get_demo_token(req: RoleSwitchRequest):
    """Issues a demo persona token only when explicitly enabled for a demo environment."""
    if not settings.DEMO_MODE or not settings.ENABLE_DEMO_AUTH:
        raise HTTPException(status_code=404, detail="Demo persona authentication is disabled")
    target_role = ROLE_ALIASES.get(req.role, req.role)
    matched_user = None
    for u in DEMO_USERS.values():
        if u["role"].lower() == target_role.lower():
            matched_user = u
            break
            
    if not matched_user:
        matched_user = DEMO_USERS["citizen"]

    token = issue_token_for_user(matched_user)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        username=matched_user["username"],
        role=matched_user["role"],
        title=matched_user["title"],
        agency=matched_user["agency"]
    )

@router.get("/me")
def get_authenticated_profile(user: Dict[str, Any] = Depends(get_current_user)):
    """Validates the active session token and returns verified identity claims."""
    return {
        "status": "authenticated",
        "verified_claims": user
    }
