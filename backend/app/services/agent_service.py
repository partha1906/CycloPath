from typing import Dict, Any, List, Optional, Tuple
import json
import logging
from ..schemas.schemas import AgentResponsePlan, AgentToolCallTrace
from ..core.config import settings
from .cyclone_service import cyclone_service
from .risk_engine import risk_engine
from .gemini_service import gemini_service
from .routing_service import routing_service

logger = logging.getLogger(__name__)

class CyclopathResponseAgent:
    def __init__(self):
        self.name = "Cyclopath Response Agent"

    def execute_tool(self, tool_name: str, args: Dict[str, Any], context: Dict[str, Any]) -> Tuple[Dict[str, Any], str]:
        """Executes one of the defined agent tools deterministically against application services."""
        assets: List[Dict[str, Any]] = context.get("assets", [])
        cyclone: Dict[str, Any] = context.get("cyclone", cyclone_service.get_default_cyclone_samudra())

        if tool_name == "get_cyclone_status":
            summary = (
                f"{cyclone['name']} ({cyclone['category']}): Winds {cyclone['max_wind_speed_kmh']} km/h, "
                f"Pressure {cyclone['central_pressure_hpa']} hPa, Movement {cyclone['movement_direction']} at {cyclone['movement_speed_kmh']} km/h. "
                f"Landfall estimated: {cyclone['estimated_landfall_location']} ({cyclone['estimated_landfall_time']})."
            )
            return {"cyclone": cyclone}, summary

        elif tool_name == "get_infrastructure_risk":
            district = args.get("district")
            asset_type = args.get("asset_type")
            filtered = assets
            if district:
                filtered = [a for a in filtered if a.get("district", "").lower() == district.lower()]
            if asset_type:
                filtered = [a for a in filtered if a.get("asset_type", "").lower() == asset_type.lower()]
            
            # Sort by vulnerability score
            ranked = sorted(filtered, key=lambda x: x.get("risk_assessment", {}).get("overall_vulnerability_score", 0), reverse=True)
            top_items = ranked[:5]
            summary = f"Identified {len(top_items)} priority assets. Highest risk: {top_items[0]['name'] if top_items else 'None'} ({top_items[0].get('risk_assessment', {}).get('overall_vulnerability_score', 0)}/100)."
            return {"ranked_assets": top_items, "total_matched": len(filtered)}, summary

        elif tool_name == "get_nearby_hospitals":
            district = args.get("district", "Puri")
            hospitals = [a for a in assets if a.get("asset_type") == "hospital" and (not district or a.get("district", "").lower() == district.lower())]
            hospitals.sort(key=lambda x: x.get("risk_assessment", {}).get("overall_vulnerability_score", 0), reverse=True)
            summary = f"Located {len(hospitals)} hospitals in {district}. Most vulnerable: {hospitals[0]['name'] if hospitals else 'N/A'} (Score: {hospitals[0].get('risk_assessment', {}).get('overall_vulnerability_score', 0)})."
            return {"hospitals": hospitals}, summary

        elif tool_name == "get_nearby_shelters":
            district = args.get("district", "Puri")
            shelters = [a for a in assets if a.get("asset_type") == "school_shelter" and (not district or a.get("district", "").lower() == district.lower())]
            total_cap = sum(s.get("capacity", 1000) for s in shelters)
            summary = f"Found {len(shelters)} shelters in {district} with total intake capacity of {total_cap:,} persons."
            return {"shelters": shelters, "total_capacity": total_cap}, summary

        elif tool_name == "get_flood_risk":
            coastal_assets = [a for a in assets if a.get("distance_to_coast_km", 99) <= 15.0 and a.get("elevation_m", 99) <= 6.0]
            summary = f"{len(coastal_assets)} critical infrastructure assets situated in low-elevation coastal flood/surge plains (<6m elevation, <15km coast)."
            return {"high_flood_assets": coastal_assets}, summary

        elif tool_name == "get_population_exposure":
            # Estimate population exposure based on district density
            district = args.get("district", "Puri")
            pop_estimates = {
                "Puri": 1698000,
                "Jagatsinghpur": 1136000,
                "Kendrapara": 1440000,
                "Balasore": 2320000,
                "Khurda": 2465000,
                "Bhubaneswar": 1100000
            }
            pop = pop_estimates.get(district, 1200000)
            exposed = int(pop * 0.42)
            evac_target = int(exposed * 0.28)
            summary = f"District {district}: Estimated population exposed to cyclone/surge ~{exposed:,} residents; priority evacuation target: ~{evac_target:,}."
            return {"district": district, "exposed_population": exposed, "priority_evac_target": evac_target}, summary

        elif tool_name == "calculate_route":
            route_resp = routing_service.calculate_optimal_route(
                start_lat=args.get("start_lat", 19.8210),
                start_lng=args.get("start_lng", 85.8450),
                end_lat=args.get("end_lat", 20.2312),
                end_lng=args.get("end_lng", 85.7780),
                avoid_high_flood=True
            )
            summary = f"Calculated safest corridor ({route_resp.route_name}): Distance {route_resp.distance_km} km, est. travel time {route_resp.estimated_travel_time_min} mins, Risk: {route_resp.risk_level}."
            return route_resp.model_dump(), summary

        else:
            return {}, f"Tool {tool_name} executed."

    def analyze_and_plan(
        self,
        query: str,
        district: Optional[str] = None,
        asset_id: Optional[str] = None,
        language: str = "en",
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponsePlan:
        ctx = context or {}
        assets = ctx.get("assets", [])
        cyclone = ctx.get("cyclone", cyclone_service.get_default_cyclone_samudra())
        
        # Target district
        target_district = district or "Puri"
        
        # 1. Deterministic Tool Execution Loop
        tool_traces: List[AgentToolCallTrace] = []
        
        # Tool 1: Cyclone status
        res1, sum1 = self.execute_tool("get_cyclone_status", {}, ctx)
        tool_traces.append(AgentToolCallTrace(tool_name="get_cyclone_status", arguments={}, result_summary=sum1))
        
        # Tool 2: High risk infrastructure
        res2, sum2 = self.execute_tool("get_infrastructure_risk", {"district": target_district}, ctx)
        tool_traces.append(AgentToolCallTrace(tool_name="get_infrastructure_risk", arguments={"district": target_district}, result_summary=sum2))
        
        # Tool 3: Hospitals
        res3, sum3 = self.execute_tool("get_nearby_hospitals", {"district": target_district}, ctx)
        tool_traces.append(AgentToolCallTrace(tool_name="get_nearby_hospitals", arguments={"district": target_district}, result_summary=sum3))
        
        # Tool 4: Shelters
        res4, sum4 = self.execute_tool("get_nearby_shelters", {"district": target_district}, ctx)
        tool_traces.append(AgentToolCallTrace(tool_name="get_nearby_shelters", arguments={"district": target_district}, result_summary=sum4))
        
        # Tool 5: Population exposure
        res5, sum5 = self.execute_tool("get_population_exposure", {"district": target_district}, ctx)
        tool_traces.append(AgentToolCallTrace(tool_name="get_population_exposure", arguments={"district": target_district}, result_summary=sum5))

        # 2. Extract Top Priority Assets
        priority_assets_raw = res2.get("ranked_assets", [])
        top_priorities = []
        for idx, item in enumerate(priority_assets_raw[:4], 1):
            ra = item.get("risk_assessment", {})
            first_factor = ra.get("shap_factors", [None])[0] if ra.get("shap_factors") else None
            if hasattr(first_factor, "description"):
                threat_desc = first_factor.description
            elif isinstance(first_factor, dict):
                threat_desc = first_factor.get("description", "High wind & flood exposure")
            else:
                threat_desc = "High wind & flood exposure"

            top_priorities.append({
                "rank": idx,
                "asset_id": item.get("asset_id"),
                "name": item.get("name"),
                "type": item.get("asset_type"),
                "risk_score": ra.get("overall_vulnerability_score", 85.0),
                "risk_category": ra.get("risk_category", "Critical"),
                "primary_threat": threat_desc,
                "recommended_first_step": item.get("risk_assessment", {}).get("recommended_actions", ["Activate emergency protocol"])[0]
            })

        # 3. Formulate Actionable Directives
        recommended_actions = [
            f"Direct Hospital Emergency Command at {top_priorities[0]['name'] if top_priorities else 'District Hospital'} to test auxiliary DG fuel supplies and migrate critical life-support apparatus above Level 1.",
            f"Pre-deploy 4 amphibious response ambulances along the inland bypass corridor (NH-316) to bypass vulnerable coastal roads.",
            f"De-energize coastal 33kV distribution feeders in low-lying maritime belts 3 hours prior to landfall to prevent saline flashover fire hazards.",
            f"Commence phased evacuation of approximately {res5.get('priority_evac_target', 95000):,} vulnerable citizens into {len(res4.get('shelters', []))} designated storm shelters.",
            "Position State Disaster Rapid Action Force (ODRAF / NDRF) search & rescue teams with high-discharge dewatering pumps at district headquarters."
        ]

        # 4. Evacuation Considerations
        evacuation_considerations = [
            f"Priority 1 Zone: Coastal villages within 5 km of shoreline and under 4m elevation (Puri Town, Astaranga, Kakatpur).",
            f"Evacuation Window: Complete all transit before T-4 hours ({cyclone.get('estimated_landfall_time', 'T-4 hours')}), when sustained winds exceed 65 km/h.",
            f"Special Attention: 1,420 inpatient bed transfers and 3,100 elderly/mobility-impaired persons requiring specialized transport."
        ]

        # 5. Resource Allocation Matrix
        resource_allocation = [
            {"resource": "NDRF / ODRAF Rescue Battalions", "allocation": "6 Teams (240 personnel)", "location": "Puri Sadar & Konark"},
            {"resource": "Mobile Dewatering Pumps (500 GPM)", "allocation": "14 Units", "location": "District Hospital & Low-lying Substation"},
            {"resource": "Emergency Diesel Generators (125 kVA)", "allocation": "8 Units", "location": "Designated Primary Cyclone Shelters"},
            {"resource": "Emergency Rations & Water Pouches", "allocation": "120,000 Packs", "location": "Civil Supplies Central Warehouse Pipli"}
        ]

        # 6. Citizen Communication Draft
        citizen_alert = gemini_service.generate_multilingual_citizen_alert(
            district=target_district,
            risk_level="CRITICAL",
            cyclone_name=cyclone.get("name", "Cyclone Samudra"),
            language=language
        )

        situation_summary = (
            f"Severe Cyclonic Storm {cyclone.get('name')} is tracking {cyclone.get('movement_direction')} with peak gusts of {cyclone.get('max_wind_speed_kmh')} km/h. "
            f"Landfall threat window active for {cyclone.get('estimated_landfall_location')}. "
            f"In {target_district} District, {len(top_priorities)} key infrastructure facilities have breached critical vulnerability thresholds. "
            f"High storm surge risk (up to {cyclone.get('storm_surge_potential_m')}m) and extreme precipitation ({cyclone.get('rainfall_24h_mm')}mm) "
            f"demand immediate defensive positioning and selective evacuation."
        )

        return AgentResponsePlan(
            query=query,
            language=language,
            situation_summary=situation_summary,
            top_priorities=top_priorities,
            recommended_actions=recommended_actions,
            evacuation_considerations=evacuation_considerations,
            resource_allocation=resource_allocation,
            citizen_communication_draft=citizen_alert,
            tool_calls=tool_traces
        )

agent_service = CyclopathResponseAgent()
