from fastapi import APIRouter
from typing import Dict, Any, List
from ..schemas.schemas import SimulationRequest, SimulationResult
from .infrastructure import get_all_assets_evaluated
from ..services.cyclone_service import cyclone_service
from ..services.alert_service import alert_service

router = APIRouter(prefix="/simulation", tags=["Scenario Simulator"])

# Track simulation runs
SIMULATION_HISTORY: List[Dict[str, Any]] = []

@router.post("", response_model=SimulationResult)
def run_scenario_simulation(req: SimulationRequest):
    """Executes a What-If scenario simulation recalculating infrastructure risk across all assets."""
    # 1. Baseline assessment
    baseline_assets = get_all_assets_evaluated()
    baseline_critical = sum(1 for a in baseline_assets if a["risk_assessment"]["risk_category"] == "Critical")
    baseline_high = sum(1 for a in baseline_assets if a["risk_assessment"]["risk_category"] == "High")

    # 2. Scenario assessment with new simulated conditions
    scenario_assets = get_all_assets_evaluated(
        wind_kmh=req.wind_speed_kmh,
        rain_mm=req.rainfall_mm,
        surge_m=req.storm_surge_m
    )
    scenario_critical = sum(1 for a in scenario_assets if a["risk_assessment"]["risk_category"] == "Critical")
    scenario_high = sum(1 for a in scenario_assets if a["risk_assessment"]["risk_category"] == "High")

    # Calculate percentage increase
    if baseline_critical > 0:
        increase_pct = round(((scenario_critical - baseline_critical) / baseline_critical) * 100.0, 1)
    else:
        increase_pct = 100.0 if scenario_critical > 0 else 0.0

    # Identify newly critical assets
    newly_critical = []
    for b, s in zip(baseline_assets, scenario_assets):
        b_cat = b["risk_assessment"]["risk_category"]
        s_cat = s["risk_assessment"]["risk_category"]
        if b_cat != "Critical" and s_cat == "Critical":
            newly_critical.append({
                "asset_id": s["asset_id"],
                "name": s["name"],
                "type": s["asset_type"],
                "district": s["district"],
                "old_score": b["risk_assessment"]["overall_vulnerability_score"],
                "new_score": s["risk_assessment"]["overall_vulnerability_score"],
                "score_jump": round(s["risk_assessment"]["overall_vulnerability_score"] - b["risk_assessment"]["overall_vulnerability_score"], 1)
            })

    # Sort newly critical by score jump
    newly_critical.sort(key=lambda x: x["score_jump"], reverse=True)

    # Estimate affected population based on wind & surge severity
    pop_mult = (req.wind_speed_kmh / 150.0) * (1.0 + (req.storm_surge_m / 4.0))
    est_pop = int(min(1250000, 380000 * pop_mult))

    # Top affected districts
    district_counts: Dict[str, int] = {}
    for a in scenario_assets:
        if a["risk_assessment"]["risk_category"] in ("Critical", "High"):
            district_counts[a["district"]] = district_counts.get(a["district"], 0) + 1
    top_districts = [{"district": k, "affected_assets": v} for k, v in sorted(district_counts.items(), key=lambda x: x[1], reverse=True)[:5]]

    # Trigger a real-time simulation alert
    if newly_critical:
        alert_service.add_simulation_alert(
            title=f"SIMULATION ALERT: Wind {req.wind_speed_kmh}km/h & Surge {req.storm_surge_m}m Triggered",
            severity="CRITICAL" if scenario_critical > baseline_critical else "WARNING",
            district=newly_critical[0]["district"],
            asset_name=newly_critical[0]["name"],
            message=f"Simulation results indicate {len(newly_critical)} assets transitioned into Critical Vulnerability. Priority action: inspect {newly_critical[0]['name']}.",
            action="Review updated scenario evacuation route and pre-position standby generators."
        )

    sim_id = len(SIMULATION_HISTORY) + 1
    result = SimulationResult(
        simulation_id=sim_id,
        name=f"What-If: {req.wind_speed_kmh} km/h, {req.rainfall_mm}mm, {req.storm_surge_m}m Surge",
        scenario_wind_kmh=req.wind_speed_kmh,
        scenario_rain_mm=req.rainfall_mm,
        scenario_surge_m=req.storm_surge_m,
        critical_assets_count=scenario_critical,
        high_risk_assets_count=scenario_high,
        population_affected_est=est_pop,
        baseline_critical_count=baseline_critical,
        critical_increase_pct=increase_pct,
        top_affected_districts=top_districts,
        newly_critical_assets=newly_critical[:6]
    )
    SIMULATION_HISTORY.append(result.model_dump())
    return result

@router.get("/history")
def get_simulation_history():
    """Returns past scenario runs during this session."""
    return SIMULATION_HISTORY
