import heapq
import math
from typing import Dict, Any, List, Tuple
from ..schemas.schemas import RouteResponse, RouteCoordinate

# Realistic road network nodes across coastal Odisha corridor
ROAD_NODES = {
    "Puri_Center": {"name": "Puri City Center", "lat": 19.8135, "lng": 85.8312, "elevation_m": 4.0},
    "Puri_District_Hosp": {"name": "Puri District Headquarters Hospital", "lat": 19.8210, "lng": 85.8450, "elevation_m": 5.0},
    "Puri_Cyclone_Shelter_A": {"name": "Puri Town Multi-Purpose Cyclone Shelter", "lat": 19.8050, "lng": 85.8200, "elevation_m": 8.0},
    "Brahmagiri_Junction": {"name": "Brahmagiri Highway Junction", "lat": 19.8000, "lng": 85.6500, "elevation_m": 6.5},
    "Konark_Marine_Drive": {"name": "Konark Marine Coastal Road", "lat": 19.8876, "lng": 86.0945, "elevation_m": 3.0},
    "Pipli_Inland_Junction": {"name": "Pipli Inland Bypass Junction (NH-316)", "lat": 20.1130, "lng": 85.8270, "elevation_m": 18.0},
    "Bhubaneswar_AIIMS": {"name": "AIIMS Hospital Bhubaneswar", "lat": 20.2312, "lng": 85.7780, "elevation_m": 42.0},
    "Bhubaneswar_Center": {"name": "Bhubaneswar Central Command Post", "lat": 20.2961, "lng": 85.8245, "elevation_m": 45.0},
    "Cuttack_SCB_Medical": {"name": "SCB Medical College & Hospital Cuttack", "lat": 20.4720, "lng": 85.8900, "elevation_m": 28.0},
    "Jagatsinghpur_HQ": {"name": "Jagatsinghpur District Headquarters", "lat": 20.2660, "lng": 86.1700, "elevation_m": 12.0},
    "Paradip_Port_Hospital": {"name": "Paradip Port Trust Hospital", "lat": 20.2980, "lng": 86.6740, "elevation_m": 2.5},
    "Paradip_Super_Shelter": {"name": "Paradip Model Cyclone Shelter", "lat": 20.3120, "lng": 86.6500, "elevation_m": 6.0},
    "Kendrapara_Town": {"name": "Kendrapara Emergency Shelter Hub", "lat": 20.5000, "lng": 86.4200, "elevation_m": 15.0}
}

# Road segments (edges) connecting the nodes: (u, v, distance_km, flood_risk_factor 0-1, is_coastal)
ROAD_EDGES = [
    # Coastal Marine Drive (Scenic but vulnerable to storm surge)
    ("Puri_District_Hosp", "Konark_Marine_Drive", 35.0, 0.85, True),
    ("Konark_Marine_Drive", "Jagatsinghpur_HQ", 48.0, 0.70, True),
    ("Jagatsinghpur_HQ", "Paradip_Port_Hospital", 38.0, 0.75, True),
    ("Paradip_Port_Hospital", "Paradip_Super_Shelter", 5.0, 0.65, True),

    # National Highway 316 (Elevated inland corridor - safer)
    ("Puri_District_Hosp", "Puri_Center", 4.0, 0.40, False),
    ("Puri_Center", "Puri_Cyclone_Shelter_A", 3.0, 0.25, False),
    ("Puri_Center", "Brahmagiri_Junction", 22.0, 0.45, False),
    ("Puri_District_Hosp", "Pipli_Inland_Junction", 40.0, 0.25, False),
    ("Pipli_Inland_Junction", "Bhubaneswar_AIIMS", 24.0, 0.10, False),
    ("Pipli_Inland_Junction", "Bhubaneswar_Center", 28.0, 0.10, False),
    ("Bhubaneswar_Center", "Cuttack_SCB_Medical", 28.0, 0.15, False),
    ("Bhubaneswar_Center", "Jagatsinghpur_HQ", 46.0, 0.30, False),
    ("Cuttack_SCB_Medical", "Kendrapara_Town", 55.0, 0.20, False),
    ("Kendrapara_Town", "Paradip_Super_Shelter", 42.0, 0.35, False),
    ("Jagatsinghpur_HQ", "Paradip_Super_Shelter", 36.0, 0.50, False),
]

class EmergencyRoutingService:
    def __init__(self):
        self._build_graph()

    def _build_graph(self):
        self.adj: Dict[str, List[Tuple[str, float, float, bool]]] = {node: [] for node in ROAD_NODES}
        for u, v, dist, flood_factor, is_coastal in ROAD_EDGES:
            self.adj[u].append((v, dist, flood_factor, is_coastal))
            self.adj[v].append((u, dist, flood_factor, is_coastal))

    def _find_nearest_node(self, lat: float, lng: float) -> str:
        """Finds closest node in the road network to given coordinates."""
        best_node = "Puri_District_Hosp"
        min_dist = float("inf")
        for node_id, data in ROAD_NODES.items():
            dist = math.hypot(lat - data["lat"], lng - data["lng"])
            if dist < min_dist:
                min_dist = dist
                best_node = node_id
        return best_node

    def calculate_optimal_route(
        self,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
        avoid_high_flood: bool = True,
        vehicle_type: str = "ambulance"
    ) -> RouteResponse:
        start_node = self._find_nearest_node(start_lat, start_lng)
        end_node = self._find_nearest_node(end_lat, end_lng)
        
        # If start and end are same node, pick sensible fallback destination
        if start_node == end_node:
            end_node = "Bhubaneswar_AIIMS" if start_node.startswith("Puri") else "Puri_Cyclone_Shelter_A"

        # Dijkstra with multi-hazard cost weighting
        # Cost = Distance * (1.0 + Flood_Weight * 3.0 + Coastal_Weight * 2.0)
        flood_penalty = 3.5 if avoid_high_flood else 1.0
        
        def run_dijkstra(coastal_penalty_mult: float) -> Tuple[List[str], float, float]:
            pq = [(0.0, start_node, [start_node], 0.0)]
            visited = set()
            
            while pq:
                cost, curr, path, total_dist = heapq.heappop(pq)
                if curr == end_node:
                    return path, total_dist, cost
                if curr in visited:
                    continue
                visited.add(curr)
                
                for neighbor, dist, flood_factor, is_coastal in self.adj[curr]:
                    if neighbor in visited:
                        continue
                    edge_penalty = 1.0 + (flood_factor * flood_penalty)
                    if is_coastal:
                        edge_penalty += coastal_penalty_mult
                    edge_cost = dist * edge_penalty
                    heapq.heappush(pq, (cost + edge_cost, neighbor, path + [neighbor], total_dist + dist))
                    
            return [start_node, end_node], 50.0, 100.0

        # Primary route: high coastal penalty (prefers elevated inland NH)
        prim_path_nodes, prim_dist, prim_cost = run_dijkstra(coastal_penalty_mult=4.0)
        
        # Alternate route: standard direct routing
        alt_path_nodes, alt_dist, alt_cost = run_dijkstra(coastal_penalty_mult=0.5)

        # Convert to coordinates
        def nodes_to_coords(nodes: List[str]) -> List[RouteCoordinate]:
            return [RouteCoordinate(lat=ROAD_NODES[n]["lat"], lng=ROAD_NODES[n]["lng"]) for n in nodes]

        prim_coords = nodes_to_coords(prim_path_nodes)
        alt_coords = nodes_to_coords(alt_path_nodes)

        # Calculate travel time based on vehicle type and risk
        speed_kmh = 60.0 if vehicle_type == "ambulance" else 45.0
        # Reduced speed under cyclone precipitation
        effective_speed = speed_kmh * 0.70
        est_time_min = round((prim_dist / effective_speed) * 60.0, 1)

        # Safety notes and assessment
        safety_notes = [
            "Inland NH-316 corridor is clear and prioritized for emergency convoys.",
            "Coastal Marine Drive exhibits high storm-surge breach risk; avoid between T-6h and T+6h of landfall.",
            f"Pre-positioned tree clearing teams are deployed along {ROAD_NODES[prim_path_nodes[min(1, len(prim_path_nodes)-1)]]['name']}."
        ]

        waypoints_text = [ROAD_NODES[n]["name"] for n in prim_path_nodes]
        
        return RouteResponse(
            route_name=f"Safe Emergency Corridor: {ROAD_NODES[start_node]['name']} -> {ROAD_NODES[end_node]['name']}",
            distance_km=round(prim_dist, 1),
            estimated_travel_time_min=est_time_min,
            risk_level="SAFE" if prim_cost < 120 else "CAUTION",
            flood_exposure_index=round(min(1.0, prim_cost / (prim_dist * 4.0)), 2),
            path=prim_coords,
            waypoints=waypoints_text,
            alternate_route_available=True,
            alternate_path=alt_coords,
            safety_notes=safety_notes
        )

routing_service = EmergencyRoutingService()
