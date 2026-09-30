export interface CyclonePoint {
  time: string;
  lat: number;
  lng: number;
  wind_kmh: number;
  intensity: string;
  pressure_hpa: number;
}

export interface CycloneData {
  id: number;
  name: string;
  cyclone_code: string;
  category: string;
  status: string;
  current_lat: number;
  current_lng: number;
  max_wind_speed_kmh: number;
  central_pressure_hpa: number;
  movement_speed_kmh: number;
  movement_direction: string;
  estimated_landfall_time: string;
  estimated_landfall_location: string;
  storm_surge_potential_m: number;
  rainfall_24h_mm: number;
  trajectory_points: CyclonePoint[];
  cone_coordinates: number[][];
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class CycloneService {
  getDefaultCycloneSamudra(): CycloneData {
    const trajectory: CyclonePoint[] = [
      { time: 'T-36h (Past)', lat: 17.2, lng: 87.5, wind_kmh: 120.0, intensity: 'Very Severe Cyclonic Storm', pressure_hpa: 978.0 },
      { time: 'T-24h (Past)', lat: 18.1, lng: 86.8, wind_kmh: 145.0, intensity: 'Very Severe Cyclonic Storm', pressure_hpa: 966.0 },
      { time: 'T-12h (Current)', lat: 19.3, lng: 86.2, wind_kmh: 165.0, intensity: 'Extremely Severe Cyclonic Storm', pressure_hpa: 952.0 },
      { time: 'T-6h (Forecast)', lat: 19.8, lng: 85.9, wind_kmh: 175.0, intensity: 'Extremely Severe Cyclonic Storm', pressure_hpa: 948.0 },
      { time: 'Landfall (T-0)', lat: 20.15, lng: 85.85, wind_kmh: 185.0, intensity: 'Extremely Severe Cyclonic Storm', pressure_hpa: 942.0 },
      { time: 'T+6h (Inland)', lat: 20.65, lng: 85.7, wind_kmh: 130.0, intensity: 'Severe Cyclonic Storm', pressure_hpa: 970.0 },
      { time: 'T+12h (Inland)', lat: 21.2, lng: 85.5, wind_kmh: 90.0, intensity: 'Cyclonic Storm', pressure_hpa: 985.0 },
      { time: 'T+24h (Dissipating)', lat: 22.1, lng: 85.2, wind_kmh: 55.0, intensity: 'Deep Depression', pressure_hpa: 995.0 },
    ];

    const cone: number[][] = [
      [19.3, 86.2],
      [19.9, 87.1],
      [20.7, 87.4],
      [21.8, 86.8],
      [22.4, 85.6],
      [21.8, 84.6],
      [20.5, 84.8],
      [19.7, 85.1],
      [19.3, 86.2],
    ];

    return {
      id: 1,
      name: 'Cyclone SAMUDRA',
      cyclone_code: 'BOB-2026-03',
      category: 'Extremely Severe Cyclonic Storm (ESCS)',
      status: 'active',
      current_lat: 19.3,
      current_lng: 86.2,
      max_wind_speed_kmh: 165.0,
      central_pressure_hpa: 952.0,
      movement_speed_kmh: 17.5,
      movement_direction: 'NNW',
      estimated_landfall_time: 'Today at 21:30 IST (~6.5 hours)',
      estimated_landfall_location: 'Coastal Puri - Jagatsinghpur Corridor, Odisha',
      storm_surge_potential_m: 4.5,
      rainfall_24h_mm: 340.0,
      trajectory_points: trajectory,
      cone_coordinates: cone,
    };
  }

  calculateCycloneExposure(
    assetLat: number,
    assetLng: number,
    cycloneLat: number,
    cycloneLng: number,
    maxWindKmh: number
  ): [number, number] {
    const distKm = haversineDistance(assetLat, assetLng, cycloneLat, cycloneLng);

    let windFactor: number;
    if (distKm <= 35) {
      windFactor = 1.0;
    } else if (distKm <= 80) {
      windFactor = 0.85 - ((distKm - 35) / 45.0) * 0.25;
    } else if (distKm <= 160) {
      windFactor = 0.6 - ((distKm - 80) / 80.0) * 0.35;
    } else if (distKm <= 300) {
      windFactor = 0.25 - ((distKm - 160) / 140.0) * 0.2;
    } else {
      windFactor = 0.05;
    }

    const exposure = Math.min(100.0, Math.max(5.0, (maxWindKmh / 200.0) * windFactor * 100.0));
    return [distKm, Math.round(exposure * 10) / 10];
  }
}

export const cycloneService = new CycloneService();
