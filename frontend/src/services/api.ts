import {
  Cyclone,
  InfrastructureAsset,
  RiskSummary,
  SimulationRequest,
  SimulationResult,
  AgentResponsePlan,
  Alert,
  RouteResponse,
  MultimodalAnalysis,
  SystemHealth,
  DataSource
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

let currentRole = 'Disaster Management Authority';
let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('cyclopath_jwt_token') : null;

export function setActiveUserRole(role: string) {
  currentRole = role;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('cyclopath_jwt_token', token);
  } else {
    localStorage.removeItem('cyclopath_jwt_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('cyclopath_jwt_token');
  }
  return authToken;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Role': currentRole,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {})
  };

  const res = await fetch(url, {
    ...options,
    headers
  });
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch {}
    throw new Error(`API error ${res.status}: ${errorDetail}`);
  }
  return res.json();
}

export const api = {
  // Authentication & Session
  async login(username: string, password: string): Promise<{ access_token: string; role: string; username: string }> {
    const data = await fetchJson<{ access_token: string; role: string; username: string }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthToken(data.access_token);
    return data;
  },

  async fetchDemoToken(role: string): Promise<{ access_token: string; role: string; username: string }> {
    const data = await fetchJson<{ access_token: string; role: string; username: string }>(`${API_BASE}/auth/demo-token`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    setAuthToken(data.access_token);
    return data;
  },

  async getProfile(): Promise<any> {
    return fetchJson(`${API_BASE}/auth/me`);
  },
  // Cyclones
  async getCyclones(): Promise<Cyclone[]> {
    return fetchJson<Cyclone[]>(`${API_BASE}/cyclones`);
  },

  async getCyclone(id: number = 1): Promise<Cyclone> {
    return fetchJson<Cyclone>(`${API_BASE}/cyclones/${id}`);
  },

  // Risk Engine Summary & Weights
  async getRiskSummary(): Promise<RiskSummary> {
    return fetchJson<RiskSummary>(`${API_BASE}/risk/summary`);
  },

  async getRiskWeights(): Promise<Record<string, number>> {
    return fetchJson<Record<string, number>>(`${API_BASE}/risk/weights`);
  },

  async updateRiskWeights(weights: Record<string, number>): Promise<Record<string, number>> {
    return fetchJson<Record<string, number>>(`${API_BASE}/risk/weights`, {
      method: 'POST',
      body: JSON.stringify(weights)
    });
  },

  // Infrastructure Catalog & Detail
  async getInfrastructure(params?: {
    asset_type?: string;
    district?: string;
    risk_category?: string;
    search?: string;
  }): Promise<InfrastructureAsset[]> {
    const query = new URLSearchParams();
    if (params?.asset_type) query.append('asset_type', params.asset_type);
    if (params?.district) query.append('district', params.district);
    if (params?.risk_category) query.append('risk_category', params.risk_category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<InfrastructureAsset[]>(`${API_BASE}/infrastructure${qs}`);
  },

  async getAssetDetail(assetId: string): Promise<InfrastructureAsset> {
    return fetchJson<InfrastructureAsset>(`${API_BASE}/infrastructure/${assetId}`);
  },

  // Scenario Simulator
  async runSimulation(payload: SimulationRequest): Promise<SimulationResult> {
    return fetchJson<SimulationResult>(`${API_BASE}/simulation`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // AI Response Agent
  async queryAgent(payload: {
    query: string;
    district?: string;
    asset_id?: string;
    language?: string;
  }): Promise<AgentResponsePlan> {
    return fetchJson<AgentResponsePlan>(`${API_BASE}/agent/query`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Multimodal AI
  async analyzeMultimodalImage(payload: {
    image_base64?: string;
    asset_id?: string;
    context_notes?: string;
  }): Promise<MultimodalAnalysis> {
    return fetchJson<MultimodalAnalysis>(`${API_BASE}/multimodal/analyze`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Routing
  async calculateOptimalRoute(payload: {
    start_lat: number;
    start_lng: number;
    end_lat: number;
    end_lng: number;
    avoid_high_flood?: boolean;
    vehicle_type?: string;
  }): Promise<RouteResponse> {
    return fetchJson<RouteResponse>(`${API_BASE}/routes/optimize`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Alerts
  async getAlerts(params?: { severity?: string; district?: string }): Promise<Alert[]> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.district) query.append('district', params.district);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Alert[]>(`${API_BASE}/alerts${qs}`);
  },

  async acknowledgeAlert(alertId: number): Promise<{ status: string; alert_id: number }> {
    return fetchJson<{ status: string; alert_id: number }>(`${API_BASE}/alerts/${alertId}/ack`, {
      method: 'POST'
    });
  },

  // Reports
  async getLatestReport(): Promise<any> {
    return fetchJson<any>(`${API_BASE}/reports/latest`);
  },

  // Health Observability
  async getSystemHealth(): Promise<SystemHealth> {
    return fetchJson<SystemHealth>(`${API_BASE}/health`);
  },

  // Data Sources
  async getDataSources(): Promise<DataSource[]> {
    return fetchJson<DataSource[]>(`${API_BASE}/data-sources`);
  }
};
