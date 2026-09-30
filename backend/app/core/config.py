import os
from pydantic import BaseModel
from typing import Dict

class RiskWeights(BaseModel):
    cyclone_exposure: float = 0.25
    flood_exposure: float = 0.20
    storm_surge: float = 0.20
    infrastructure_vulnerability: float = 0.15
    accessibility_risk: float = 0.10
    population_criticality: float = 0.10

class Settings:
    PROJECT_NAME: str = "Cyclopath AI"
    TAGLINE: str = "Predict the impact. Protect the infrastructure. Save communities."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Secrets
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "cyclopath-ai-prod")
    GOOGLE_CLOUD_REGION: str = os.getenv("GOOGLE_CLOUD_REGION", "asia-south1")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cyclopath.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    ENABLE_DEMO_AUTH: bool = os.getenv("ENABLE_DEMO_AUTH", "false").lower() in ("true", "1", "yes")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]

    # Dynamic configurable weights
    DEFAULT_WEIGHTS: RiskWeights = RiskWeights()

settings = Settings()
