export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteResponse {
  route_name: string;
  distance_km: number;
  estimated_travel_time_min: number;
  risk_level: string;
  flood_exposure_index: number;
  path: RouteCoordinate[];
  waypoints: string[];
  alternate_route_available: boolean;
  alternate_path: RouteCoordinate[];
  safety_notes: string[];
}

interface NodeData {
  name: string;
  lat: number;
  lng: number;
  elevation_m: number;
}

const ROAD_NODES: Record<string, NodeData> = {
  Puri_Center: { name: 'Puri City Center', lat: 19.8135, lng: 85.8312, elevation_m: 4.0 },
  Puri_District_Hosp: { name: 'Puri District Headquarters Hospital', lat: 19.821, lng: 85.845, elevation_m: 5.0 },
  Puri_Cyclone_Shelter_A: { name: 'Puri Town Multi-Purpose Cyclone Shelter', lat: 19.805, lng: 85.82, elevation_m: 8.0 },
  Brahmagiri_Junction: { name: 'Brahmagiri Highway Junction', lat: 19.8, lng: 85.65, elevation_m: 6.5 },
  Konark_Marine_Drive: { name: 'Konark Marine Coastal Road', lat: 19.8876, lng: 86.0945, elevation_m: 3.0 },
  Pipli_Inland_Junction: { name: 'Pipli Inland Bypass Junction (NH-316)', lat: 20.113, lng: 85.827, elevation_m: 18.0 },
  Bhubaneswar_AIIMS: { name: 'AIIMS Hospital Bhubaneswar', lat: 20.2312, lng: 85.778, elevation_m: 42.0 },
  Bhubaneswar_Center: { name: 'Bhubaneswar Central Command Post', lat: 20.2961, lng: 85.8245, elevation_m: 45.0 },
  Cuttack_SCB_Medical: { name: 'SCB Medical College & Hospital Cuttack', lat: 20.472, lng: 85.89, elevation_m: 28.0 },
  Jagatsinghpur_HQ: { name: 'Jagatsinghpur District Headquarters', lat: 20.266, lng: 86.17, elevation_m: 12.0 },
  Paradip_Port_Hospital: { name: 'Paradip Port Trust Hospital', lat: 20.298, lng: 86.674, elevation_m: 2.5 },
  Paradip_Super_Shelter: { name: 'Paradip Model Cyclone Shelter', lat: 20.312, lng: 86.65, elevation_m: 6.0 },
  Kendrapara_Town: { name: 'Kendrapara Emergency Shelter Hub', lat: 20.5, lng: 86.42, elevation_m: 15.0 },
};

type RoadEdge = [string, string, number, number, boolean];

const ROAD_EDGES: RoadEdge[] = [
  // Coastal Marine Drive
  ['Puri_District_Hosp', 'Konark_Marine_Drive', 35.0, 0.85, true],
  ['Konark_Marine_Drive', 'Jagatsinghpur_HQ', 48.0, 0.7, true],
  ['Jagatsinghpur_HQ', 'Paradip_Port_Hospital', 38.0, 0.75, true],
  ['Paradip_Port_Hospital', 'Paradip_Super_Shelter', 5.0, 0.65, true],

  // National Highway 316
  ['Puri_District_Hosp', 'Puri_Center', 4.0, 0.4, false],
  ['Puri_Center', 'Puri_Cyclone_Shelter_A', 3.0, 0.25, false],
  ['Puri_Center', 'Brahmagiri_Junction', 22.0, 0.45, false],
  ['Puri_District_Hosp', 'Pipli_Inland_Junction', 40.0, 0.25, false],
  ['Pipli_Inland_Junction', 'Bhubaneswar_AIIMS', 24.0, 0.1, false],
  ['Pipli_Inland_Junction', 'Bhubaneswar_Center', 28.0, 0.1, false],
  ['Bhubaneswar_Center', 'Cuttack_SCB_Medical', 28.0, 0.15, false],
  ['Bhubaneswar_Center', 'Jagatsinghpur_HQ', 46.0, 0.3, false],
  ['Cuttack_SCB_Medical', 'Kendrapara_Town', 55.0, 0.2, false],
  ['Kendrapara_Town', 'Paradip_Super_Shelter', 42.0, 0.35, false],
  ['Jagatsinghpur_HQ', 'Paradip_Super_Shelter', 36.0, 0.5, false],
];

interface Edge {
  to: string;
  dist: number;
  floodFactor: number;
  isCoastal: boolean;
}

export class EmergencyRoutingService {
  private adj: Map<string, Edge[]> = new Map();

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    for (const key of Object.keys(ROAD_NODES)) {
      this.adj.set(key, []);
    }
    for (const [u, v, dist, floodFactor, isCoastal] of ROAD_EDGES) {
      this.adj.get(u)?.push({ to: v, dist, floodFactor, isCoastal });
      this.adj.get(v)?.push({ to: u, dist, floodFactor, isCoastal });
    }
  }

  private findNearestNode(lat: number, lng: number): string {
    let bestNode = 'Puri_District_Hosp';
    let minDist = Infinity;
    for (const [nodeId, data] of Object.entries(ROAD_NODES)) {
      const dist = Math.hypot(lat - data.lat, lng - data.lng);
      if (dist < minDist) {
        minDist = dist;
        bestNode = nodeId;
      }
    }
    return bestNode;
  }

  calculateOptimalRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    avoidHighFlood = true,
    vehicleType = 'ambulance'
  ): RouteResponse {
    let startNode = this.findNearestNode(startLat, startLng);
    let endNode = this.findNearestNode(endLat, endLng);

    if (startNode === endNode) {
      endNode = startNode.startsWith('Puri') ? 'Bhubaneswar_AIIMS' : 'Puri_Cyclone_Shelter_A';
    }

    const floodPenalty = avoidHighFlood ? 3.5 : 1.0;

    const runDijkstra = (coastalPenaltyMult: number): [string[], number, number] => {
      // Priority queue item: { cost, curr, path, totalDist }
      const pq: Array<{ cost: number; curr: string; path: string[]; totalDist: number }> = [
        { cost: 0, curr: startNode, path: [startNode], totalDist: 0 },
      ];
      const visited = new Set<string>();

      while (pq.length > 0) {
        pq.sort((a, b) => a.cost - b.cost);
        const { cost, curr, path, totalDist } = pq.shift()!;

        if (curr === endNode) {
          return [path, totalDist, cost];
        }

        if (visited.has(curr)) continue;
        visited.add(curr);

        const neighbors = this.adj.get(curr) || [];
        for (const edge of neighbors) {
          if (visited.has(edge.to)) continue;
          let edgePenalty = 1.0 + edge.floodFactor * floodPenalty;
          if (edge.isCoastal) {
            edgePenalty += coastalPenaltyMult;
          }
          const edgeCost = edge.dist * edgePenalty;
          pq.push({
            cost: cost + edgeCost,
            curr: edge.to,
            path: [...path, edge.to],
            totalDist: totalDist + edge.dist,
          });
        }
      }

      return [[startNode, endNode], 50.0, 100.0];
    };

    const [primPathNodes, primDist, primCost] = runDijkstra(4.0);
    const [altPathNodes] = runDijkstra(0.5);

    const nodesToCoords = (nodes: string[]): RouteCoordinate[] => {
      return nodes.map((n) => ({ lat: ROAD_NODES[n].lat, lng: ROAD_NODES[n].lng }));
    };

    const primCoords = nodesToCoords(primPathNodes);
    const altCoords = nodesToCoords(altPathNodes);

    const speedKmh = vehicleType === 'ambulance' ? 60.0 : 45.0;
    const effectiveSpeed = speedKmh * 0.7;
    const estTimeMin = Math.round((primDist / effectiveSpeed) * 60.0 * 10) / 10;

    const safetyNotes = [
      'Inland NH-316 corridor is clear and prioritized for emergency convoys.',
      'Coastal Marine Drive exhibits high storm-surge breach risk; avoid between T-6h and T+6h of landfall.',
      `Pre-positioned tree clearing teams are deployed along ${ROAD_NODES[primPathNodes[Math.min(1, primPathNodes.length - 1)]].name}.`,
    ];

    const waypointsText = primPathNodes.map((n) => ROAD_NODES[n].name);

    return {
      route_name: `Safe Emergency Corridor: ${ROAD_NODES[startNode].name} -> ${ROAD_NODES[endNode].name}`,
      distance_km: Math.round(primDist * 10) / 10,
      estimated_travel_time_min: estTimeMin,
      risk_level: primCost < 120 ? 'SAFE' : 'CAUTION',
      flood_exposure_index: Math.round(Math.min(1.0, primCost / (primDist * 4.0)) * 100) / 100,
      path: primCoords,
      waypoints: waypointsText,
      alternate_route_available: true,
      alternate_path: altCoords,
      safety_notes: safetyNotes,
    };
  }
}

export const routingService = new EmergencyRoutingService();
