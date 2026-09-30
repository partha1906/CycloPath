from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    asset_type = Column(String(50), index=True, nullable=False)  # hospital, power_station, bridge, road, school_shelter, water_facility, telecom, port
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    importance = Column(String(50), default="high")  # critical, high, moderate, standard
    capacity = Column(Integer, default=500)
    construction_type = Column(String(100), default="reinforced_concrete")
    elevation_m = Column(Float, default=5.0)
    distance_to_coast_km = Column(Float, default=10.0)
    backup_power = Column(Boolean, default=True)
    power_dependency = Column(Float, default=80.0)
    road_accessibility = Column(Float, default=80.0)
    population_dependency = Column(Float, default=75.0)
    historical_vulnerability = Column(Float, default=60.0)
    status = Column(String(50), default="operational")
    notes = Column(Text, nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    risk_assessments = relationship("RiskAssessment", back_populates="asset")


class Cyclone(Base):
    __tablename__ = "cyclones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    cyclone_code = Column(String(50), unique=True, index=True)
    category = Column(String(100), nullable=False)  # e.g., "Extremely Severe Cyclonic Storm (ESCS)"
    status = Column(String(50), default="active")  # active, simulated, archived
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    max_wind_speed_kmh = Column(Float, nullable=False)
    central_pressure_hpa = Column(Float, default=960.0)
    movement_speed_kmh = Column(Float, default=18.0)
    movement_direction = Column(String(20), default="NW")
    estimated_landfall_time = Column(String(100), default="T-12 Hours")
    estimated_landfall_location = Column(String(200), default="Between Puri and Paradip, Odisha")
    storm_surge_potential_m = Column(Float, default=4.2)
    rainfall_24h_mm = Column(Float, default=320.0)
    trajectory_points = Column(JSON, default=list)  # list of {time, lat, lng, wind_kmh, intensity}
    cone_coordinates = Column(JSON, default=list)    # polygon coordinates of cone of uncertainty
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    risk_assessments = relationship("RiskAssessment", back_populates="cyclone")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("infrastructure_assets.id"), index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id"), index=True)
    
    cyclone_exposure = Column(Float, default=0.0)
    flood_exposure = Column(Float, default=0.0)
    storm_surge_exposure = Column(Float, default=0.0)
    infrastructure_vulnerability = Column(Float, default=0.0)
    accessibility_risk = Column(Float, default=0.0)
    population_criticality = Column(Float, default=0.0)
    
    overall_vulnerability_score = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False)  # Low, Moderate, High, Critical
    priority_rank = Column(Integer, default=1)
    
    # Explainable AI (SHAP-like attribution)
    shap_factors = Column(JSON, default=dict)
    ai_explanation = Column(Text, nullable=True)
    recommended_actions = Column(JSON, default=list)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    asset = relationship("InfrastructureAsset", back_populates="risk_assessments")
    cyclone = relationship("Cyclone", back_populates="risk_assessments")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(50), nullable=False)  # CRITICAL, HIGH, WARNING, INFO
    category = Column(String(50), nullable=False)  # SURGE, WIND, FLOOD, POWER, ROAD_CUT, SHELTER
    district = Column(String(100), nullable=False)
    asset_name = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    acknowledged = Column(Boolean, default=False)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    storm_surge_m = Column(Float, nullable=False)
    path_shift_km = Column(Float, default=0.0)
    critical_assets_count = Column(Integer, default=0)
    high_risk_assets_count = Column(Integer, default=0)
    population_affected_est = Column(Integer, default=0)
    result_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    provider = Column(String(150), nullable=False)
    data_type = Column(String(100), nullable=False)
    update_frequency = Column(String(100), default="Hourly")
    status = Column(String(50), default="Operational")
    url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(150), nullable=False)
    user_role = Column(String(50), default="Emergency_Commander")
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
