import base64
import hashlib
import hmac
import json
import time
import os
import secrets
from typing import Dict, Any, Optional, List
from .config import settings

# Each process gets an unpredictable fallback for single-instance local development.
# Multi-instance deployments must set JWT_SECRET consistently through a secret manager.
_EPHEMERAL_JWT_SECRET = secrets.token_urlsafe(48)

def get_jwt_secret() -> str:
    return settings.JWT_SECRET or os.getenv("JWT_SECRET") or _EPHEMERAL_JWT_SECRET

# Registered demo accounts for authenticated command staff & public users
DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "admin": {
        "username": "admin",
        "role": "Disaster Management Authority",
        "title": "State Incident Commander",
        "agency": "Odisha State Disaster Management Authority (OSDMA)"
    },
    "municipal": {
        "username": "municipal",
        "role": "Municipal Officer",
        "title": "Municipal Commissioner",
        "agency": "Puri Municipal Corporation"
    },
    "responder": {
        "username": "responder",
        "role": "Emergency Responder",
        "title": "ODRAF Rapid Action Lead",
        "agency": "Odisha Disaster Rapid Action Force (ODRAF)"
    },
    "citizen": {
        "username": "citizen",
        "role": "Public Citizen",
        "title": "Coastal Community Resident",
        "agency": "General Public"
    }
}

# Role aliases normalization
ROLE_ALIASES = {
    "Disaster_Authority": "Disaster Management Authority",
    "Disaster Management Authority": "Disaster Management Authority",
    "Municipal_Officer": "Municipal Officer",
    "Municipal Officer": "Municipal Officer",
    "First_Responder": "Emergency Responder",
    "Emergency_Responder": "Emergency Responder",
    "Emergency Responder": "Emergency Responder",
    "Public_Citizen": "Public Citizen",
    "Public Citizen": "Public Citizen",
}

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')

def base64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += '=' * padding
    return base64.urlsafe_b64decode(data.encode('ascii'))

def create_access_token(data: dict, expires_in_seconds: int = 86400) -> str:
    """Generates an RFC 7519 HMAC-SHA256 signed JSON Web Token."""
    secret = get_jwt_secret()
    payload = data.copy()
    payload["iat"] = int(time.time())
    payload["exp"] = int(time.time()) + expires_in_seconds

    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_token(token: str) -> Dict[str, Any]:
    """Cryptographically verifies a JWT token signature and expiration."""
    secret = get_jwt_secret()
    parts = token.strip().split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT token format; expected 3 segments")

    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()

    try:
        actual_sig = base64url_decode(signature_b64)
    except Exception:
        raise ValueError("Invalid signature encoding")

    if not hmac.compare_digest(actual_sig, expected_sig):
        raise ValueError("Signature verification failed: invalid token signature")

    try:
        payload_bytes = base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        raise ValueError("Invalid payload encoding")

    if "exp" in payload and time.time() > payload["exp"]:
        raise ValueError("Token has expired")

    return payload

def authenticate_user(username: str, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Authenticates demo users only when their password is supplied through the environment."""
    user_key = username.lower().strip()
    user = DEMO_USERS.get(user_key)
    if not user or not password:
        return None
    password_env = {
        "admin": "AUTH_DEMO_ADMIN_PASSWORD",
        "municipal": "AUTH_DEMO_MUNICIPAL_PASSWORD",
        "responder": "AUTH_DEMO_RESPONDER_PASSWORD",
        "citizen": "AUTH_DEMO_CITIZEN_PASSWORD",
    }.get(user_key)
    configured_password = os.getenv(password_env, "") if password_env else ""
    if not configured_password or not hmac.compare_digest(configured_password, password):
        return None
    return user

def issue_token_for_user(user: Dict[str, Any]) -> str:
    """Issues a cryptographically signed JWT for the authenticated user."""
    return create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "title": user.get("title", ""),
        "agency": user.get("agency", "")
    })
