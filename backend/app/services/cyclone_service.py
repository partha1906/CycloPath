import math
from typing import Dict, Any, List, Tuple
from ..schemas.schemas import CyclonePoint

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0 # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class CycloneService:
    @staticmethod
    def get_default_cyclone_samudra() -> Dict[str, Any]:
        """Returns the primary demo cyclone: 'Severe Cyclonic Storm SAMUDRA' approaching Odisha coast."""
        trajectory = [
            {"time": "T-36h (Past)", "lat": 17.2, "lng": 87.5, "wind_kmh": 120.0, "intensity": "Very Severe Cyclonic Storm", "pressure_hpa": 978.0},
            {"time": "T-24h (Past)", "lat": 18.1, "lng": 86.8, "wind_kmh": 145.0, "intensity": "Very Severe Cyclonic Storm", "pressure_hpa": 966.0},
            {"time": "T-12h (Current)", "lat": 19.3, "lng": 86.2, "wind_kmh": 165.0, "intensity": "Extremely Severe Cyclonic Storm", "pressure_hpa": 952.0},
            {"time": "T-6h (Forecast)", "lat": 19.8, "lng": 85.9, "wind_kmh": 175.0, "intensity": "Extremely Severe Cyclonic Storm", "pressure_hpa": 948.0},
            {"time": "Landfall (T-0)", "lat": 20.15, "lng": 85.85, "wind_kmh": 185.0, "intensity": "Extremely Severe Cyclonic Storm", "pressure_hpa": 942.0},
            {"time": "T+6h (Inland)", "lat": 20.65, "lng": 85.70, "wind_kmh": 130.0, "intensity": "Severe Cyclonic Storm", "pressure_hpa": 970.0},
            {"time": "T+12h (Inland)", "lat": 21.20, "lng": 85.50, "wind_kmh": 90.0, "intensity": "Cyclonic Storm", "pressure_hpa": 985.0},
            {"time": "T+24h (Dissipating)", "lat": 22.10, "lng": 85.20, "wind_kmh": 55.0, "intensity": "Deep Depression", "pressure_hpa": 995.0},
        ]
        
        # Cone of uncertainty polygon coordinates (lat, lng)
        cone = [
            [19.3, 86.2],
            [19.9, 87.1],
            [20.7, 87.4],
            [21.8, 86.8],
            [22.4, 85.6],
            [21.8, 84.6],
            [20.5, 84.8],
            [19.7, 85.1],
            [19.3, 86.2]
        ]
        
        return {
            "id": 1,
            "name": "Cyclone SAMUDRA",
            "cyclone_code": "BOB-2026-03",
            "category": "Extremely Severe Cyclonic Storm (ESCS)",
            "status": "active",
            "current_lat": 19.3,
            "current_lng": 86.2,
            "max_wind_speed_kmh": 165.0,
            "central_pressure_hpa": 952.0,
            "movement_speed_kmh": 17.5,
            "movement_direction": "NNW",
            "estimated_landfall_time": "Today at 21:30 IST (~6.5 hours)",
            "estimated_landfall_location": "Coastal Puri - Jagatsinghpur Corridor, Odisha",
            "storm_surge_potential_m": 4.5,
            "rainfall_24h_mm": 340.0,
            "trajectory_points": trajectory,
            "cone_coordinates": cone
        }

    @staticmethod
    def calculate_cyclone_exposure(
        asset_lat: float, 
        asset_lng: float, 
        cyclone_lat: float, 
        cyclone_lng: float, 
        max_wind_kmh: float
    ) -> Tuple[float, float]:
        """Calculates distance to eye in km and cyclone wind exposure score (0-100)."""
        dist_km = haversine_distance(asset_lat, asset_lng, cyclone_lat, cyclone_lng)
        
        # Radius of maximum winds typically ~30-50km, gale winds reach 250km
        if dist_km <= 35:
            wind_factor = 1.0
        elif dist_km <= 80:
            wind_factor = 0.85 - ((dist_km - 35) / 45.0) * 0.25
        elif dist_km <= 160:
            wind_factor = 0.60 - ((dist_km - 80) / 80.0) * 0.35
        elif dist_km <= 300:
            wind_factor = 0.25 - ((dist_km - 160) / 140.0) * 0.20
        else:
            wind_factor = 0.05
            
        exposure = min(100.0, max(5.0, (max_wind_kmh / 200.0) * wind_factor * 100.0))
        return dist_km, round(exposure, 1)

cyclone_service = CycloneService()
