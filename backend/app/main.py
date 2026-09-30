from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.cyclone import router as cyclone_router
from .api.infrastructure import router as infrastructure_router
from .api.risk import router as risk_router
from .api.simulation import router as simulation_router
from .api.agent import router as agent_router
from .api.multimodal import router as multimodal_router
from .api.routing import router as routing_router
from .api.alerts import router as alerts_router
from .api.reports import router as reports_router
from .api.health import router as health_router
from .api.data_sources import router as data_sources_router
from .api.auth import router as auth_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered disaster intelligence and infrastructure vulnerability platform for Indian coastal communities. Built for Google's Build with AI: Code for Communities Hackathon (Track 5: Cyclone Impact & Infrastructure Vulnerability Forecast).",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (allows frontend on Vite 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(cyclone_router, prefix=api_prefix)
app.include_router(infrastructure_router, prefix=api_prefix)
app.include_router(risk_router, prefix=api_prefix)
app.include_router(simulation_router, prefix=api_prefix)
app.include_router(agent_router, prefix=api_prefix)
app.include_router(multimodal_router, prefix=api_prefix)
app.include_router(routing_router, prefix=api_prefix)
app.include_router(alerts_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(health_router, prefix=api_prefix)
app.include_router(data_sources_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "Operational",
        "mode": "Demo Simulation (Severe Cyclone SAMUDRA — Coastal Odisha Swath)",
        "disclaimer": "AI-generated risk estimates are decision-support outputs and should be validated against official IMD bulletins and SDMA directives before operational deployment.",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
