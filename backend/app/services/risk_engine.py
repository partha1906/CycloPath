import math
from typing import Dict, Any, List, Tuple
from ..core.config import settings, RiskWeights
from ..schemas.schemas import ShapFactor

class RiskEngine:
    def __init__(self, weights: RiskWeights = None):
        self.weights = weights or settings.DEFAULT_WEIGHTS

    def set_weights(self, weights: RiskWeights):
        self.weights = weights

    def calculate_flood_exposure(self, rainfall_mm: float, elevation_m: float, dist_to_coast_km: float) -> float:
        """Calculates flood exposure score (0-100) based on precipitation, elevation, and terrain."""
        rain_comp = min(100.0, (rainfall_mm / 400.0) * 100.0)
        elev_factor = max(0.1, 1.0 - (min(elevation_m, 25.0) / 25.0))
        coast_factor = max(0.2, 1.0 - (min(dist_to_coast_km, 30.0) / 30.0))
        
        score = (rain_comp * 0.55) + (elev_factor * 100.0 * 0.30) + (coast_factor * 100.0 * 0.15)
        return min(100.0, max(5.0, round(score, 1)))

    def calculate_storm_surge_exposure(self, surge_m: float, elevation_m: float, dist_to_coast_km: float) -> float:
        """Calculates storm surge inundation risk (0-100). Coastal areas with low elevation are highest."""
        if dist_to_coast_km > 25.0:
            return 5.0  # Minimal surge risk beyond 25km inland
        
        surge_elev_diff = surge_m - elevation_m
        if surge_elev_diff > 2.0:
            surge_base = 95.0
        elif surge_elev_diff > 0:
            surge_base = 75.0 + (surge_elev_diff / 2.0) * 20.0
        elif surge_elev_diff > -2.0:
            surge_base = 40.0 + ((surge_elev_diff + 2.0) / 2.0) * 35.0
        else:
            surge_base = 15.0
            
        coastal_decay = max(0.1, 1.0 - (dist_to_coast_km / 25.0))
        score = surge_base * coastal_decay
        return min(100.0, max(5.0, round(score, 1)))

    def calculate_accessibility_risk(self, base_accessibility: float, flood_exposure: float, cyclone_exposure: float) -> float:
        """Lower physical accessibility or higher flood/wind creates higher accessibility risk (0-100)."""
        physical_risk = 100.0 - base_accessibility
        combined_risk = (physical_risk * 0.35) + (flood_exposure * 0.40) + (cyclone_exposure * 0.25)
        return min(100.0, max(5.0, round(combined_risk, 1)))

    def evaluate_asset(
        self,
        asset: Dict[str, Any],
        cyclone_exposure: float,
        rainfall_mm: float,
        surge_m: float
    ) -> Dict[str, Any]:
        """Runs the complete modular multi-factor vulnerability assessment for an infrastructure asset."""
        flood_exposure = self.calculate_flood_exposure(rainfall_mm, asset.get("elevation_m", 5.0), asset.get("distance_to_coast_km", 10.0))
        surge_exposure = self.calculate_storm_surge_exposure(surge_m, asset.get("elevation_m", 5.0), asset.get("distance_to_coast_km", 10.0))
        
        # Inherent infrastructure fragility: construction, backup power, historical vulnerability
        infra_fragility = (asset.get("historical_vulnerability", 50.0) * 0.5) + (asset.get("power_dependency", 75.0) * 0.3)
        if not asset.get("backup_power", True):
            infra_fragility = min(100.0, infra_fragility + 20.0)
            
        access_risk = self.calculate_accessibility_risk(
            asset.get("road_accessibility", 80.0),
            flood_exposure,
            cyclone_exposure
        )
        
        pop_criticality = asset.get("population_dependency", 70.0)
        
        # Weighted overall score
        w = self.weights
        total_score = (
            cyclone_exposure * w.cyclone_exposure +
            flood_exposure * w.flood_exposure +
            surge_exposure * w.storm_surge +
            infra_fragility * w.infrastructure_vulnerability +
            access_risk * w.accessibility_risk +
            pop_criticality * w.population_criticality
        )
        total_score = min(100.0, max(0.0, round(total_score, 1)))
        
        # Category mapping
        if total_score >= 81.0:
            category = "Critical"
        elif total_score >= 61.0:
            category = "High"
        elif total_score >= 31.0:
            category = "Moderate"
        else:
            category = "Low"
            
        # SHAP-style attribution (weighted contribution of each factor to the final score)
        shap_factors = [
            ShapFactor(
                factor="Cyclone Exposure",
                contribution=round(cyclone_exposure * w.cyclone_exposure, 1),
                description=f"High winds & proximity ({cyclone_exposure}/100)"
            ),
            ShapFactor(
                factor="Flood Inundation Exposure",
                contribution=round(flood_exposure * w.flood_exposure, 1),
                description=f"Precipitation & low elevation terrain ({flood_exposure}/100)"
            ),
            ShapFactor(
                factor="Storm Surge Threat",
                contribution=round(surge_exposure * w.storm_surge, 1),
                description=f"Proximity to coastline & tidal rise ({surge_exposure}/100)"
            ),
            ShapFactor(
                factor="Structural & Power Dependency",
                contribution=round(infra_fragility * w.infrastructure_vulnerability, 1),
                description=f"Fragility, backup status, & power reliance ({round(infra_fragility, 1)}/100)"
            ),
            ShapFactor(
                factor="Road Accessibility Risk",
                contribution=round(access_risk * w.accessibility_risk, 1),
                description=f"Probability of cut-off routes ({round(access_risk, 1)}/100)"
            ),
            ShapFactor(
                factor="Population Criticality",
                contribution=round(pop_criticality * w.population_criticality, 1),
                description=f"High catchment dependency & life safety ({round(pop_criticality, 1)}/100)"
            ),
        ]
        
        # Sort factors by impact
        shap_factors.sort(key=lambda x: x.contribution, reverse=True)
        
        # Actionable recommendations tailored to asset type and vulnerabilities
        recommendations = self._generate_recommendations(asset, category, flood_exposure, surge_exposure, access_risk)
        ai_explanation = self._generate_rule_explanation(asset, total_score, category, shap_factors)
        
        return {
            "overall_vulnerability_score": total_score,
            "risk_category": category,
            "model_version": "Cyclopath-Vulnerability-Surrogate-v1.2",
            "data_source": "Demo Simulation (Synthetic Coastal Dataset)",
            "disclaimer": "Cyclopath AI Prototype Vulnerability Score. This score represents physical and operational asset vulnerability. It does NOT represent an official IMD cyclone warning or government evacuation order.",
            "cyclone_exposure": cyclone_exposure,
            "flood_exposure": flood_exposure,
            "storm_surge_exposure": surge_exposure,
            "infrastructure_vulnerability": round(infra_fragility, 1),
            "accessibility_risk": round(access_risk, 1),
            "population_criticality": pop_criticality,
            "shap_factors": shap_factors,
            "ai_explanation": ai_explanation,
            "recommended_actions": recommendations
        }

    def _generate_recommendations(
        self, 
        asset: Dict[str, Any], 
        category: str, 
        flood: float, 
        surge: float, 
        access_risk: float
    ) -> List[str]:
        asset_type = asset.get("asset_type", "general")
        actions = []
        
        if asset_type == "hospital":
            actions.append("Verify primary diesel generator fuel reserves (minimum 72-hour autonomous runtime).")
            if flood > 50.0 or surge > 50.0:
                actions.append("Relocate ICU backup batteries, neonatal units, and cold-chain pharmacy above ground level.")
            if access_risk > 60.0:
                actions.append("Pre-position amphibious disaster ambulances & establish alternate inland emergency access corridor.")
            actions.append("Notify District Medical Officer and place auxiliary trauma response surgical teams on active standby.")
            actions.append("Pre-position emergency blood reserves and portable water filtration units.")

        elif asset_type == "power_station":
            actions.append("De-energize coastal 33kV and 11kV feeder lines vulnerable to saline storm surge arcing.")
            actions.append("Erect perimeter sandbag dikes around low-lying transformer bays and control switchgear.")
            actions.append("Stage mobile diesel generation units (DG sets) at strategic district junction points.")
            actions.append("Pre-position emergency restoration towers (ERT) and line technician rapid-response squads.")

        elif asset_type == "bridge":
            actions.append("Deploy automated sonar/diver sensors to monitor pier scour and hydrostatic flood pressure.")
            if access_risk > 50.0:
                actions.append("Enforce precautionary heavy transport axle restrictions when sustained wind speeds exceed 90 km/h.")
            actions.append("Establish physical roadblocks and visual strobe markers on bridge approaches.")
            actions.append("Coordinate with Traffic Police to divert arterial logistics onto higher inland bypasses.")

        elif asset_type == "school_shelter":
            actions.append("Verify structural window storm shutters and reinforce roof tie-downs against gale force winds.")
            actions.append("Pre-stock 5 days of dry ration packs, chlorinated drinking water, and ORS kits.")
            actions.append("Inspect solar micro-grid inverter and emergency VHF wireless communication sets.")
            actions.append("Designate dedicated medical isolation room and mother-child care sanitization zone.")

        elif asset_type == "water_facility":
            actions.append("Secure drinking water intake wells with watertight seals against saline storm surge intrusion.")
            actions.append("Pre-stock dry bleaching powder and bulk chlorine gas neutralizing scrubbers.")
            actions.append("Top up elevated storage reservoirs (ESR) to 100% capacity prior to cyclone landfall.")

        elif asset_type == "port":
            actions.append("Order immediate vessel de-berthing and direct ships to anchor in deep sea open waters.")
            actions.append("Lash down dockside container gantry cranes and cease all heavy lift cargo operations.")
            actions.append("Evacuate non-essential marine personnel and secure hazardous chemical storage sheds.")

        else:
            actions.append("Inspect structural anchor points and clear perimeter debris.")
            actions.append("Pre-position emergency response equipment and coordinate with District Emergency Operation Centre (DEOC).")
            
        return actions

    def _generate_rule_explanation(
        self, 
        asset: Dict[str, Any], 
        score: float, 
        category: str, 
        shap_factors: List[ShapFactor]
    ) -> str:
        name = asset.get("name", "Asset")
        top_driver = shap_factors[0].factor if shap_factors else "Environmental Exposure"
        second_driver = shap_factors[1].factor if len(shap_factors) > 1 else "Infrastructure Criticality"
        
        return (
            f"{name} is assessed at {score}/100 ({category.upper()} risk). "
            f"The primary driver is {top_driver} (+{shap_factors[0].contribution} pts), "
            f"compounded by {second_driver} (+{shap_factors[1].contribution} pts). "
            f"Elevation of {asset.get('elevation_m', 5)}m and coast distance of {asset.get('distance_to_coast_km', 10)}km "
            f"amplify local exposure."
        )

risk_engine = RiskEngine()
