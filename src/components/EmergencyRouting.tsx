import React, { useState, useEffect } from 'react';
import { 
  Route as RouteIcon, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Truck, 
  ArrowRight,
  TrendingDown,
  Building2
} from 'lucide-react';
import { RouteResponse, InfrastructureAsset } from '../types';
import { api } from '../services/api';

interface EmergencyRoutingProps {
  assets?: InfrastructureAsset[];
  initialOriginAsset?: InfrastructureAsset | null;
}

export const EmergencyRouting: React.FC<EmergencyRoutingProps> = ({
  assets = [],
  initialOriginAsset
}) => {
  const [originMode, setOriginMode] = useState<'preset' | 'registry'>('preset');
  const [startPreset, setStartPreset] = useState<'puri_hosp' | 'paradip_hosp' | 'konark'>('puri_hosp');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  
  const [endPoint, setEndPoint] = useState<'aiims' | 'scb' | 'puri_shelter'>('aiims');
  const [avoidFlood, setAvoidFlood] = useState(true);
  const [vehicleType, setVehicleType] = useState('ambulance');

  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);

  const startCoordsMap = {
    puri_hosp: { name: 'Puri District Headquarters Hospital', lat: 19.8210, lng: 85.8450 },
    paradip_hosp: { name: 'Paradip Port Trust Hospital', lat: 20.2980, lng: 86.6740 },
    konark: { name: 'Konark Sub-Divisional Hospital', lat: 19.8920, lng: 86.1150 }
  };

  const endCoordsMap = {
    aiims: { name: 'AIIMS Hospital Bhubaneswar (Inland Sanctuary)', lat: 20.2312, lng: 85.7780 },
    scb: { name: 'SCB Medical College Cuttack (Tertiary Referral)', lat: 20.4720, lng: 85.8900 },
    puri_shelter: { name: 'Puri Model Cyclone Shelter (Stilt Hub)', lat: 19.8050, lng: 85.8200 }
  };

  // If initialOriginAsset provided, configure registry mode
  useEffect(() => {
    if (initialOriginAsset) {
      setOriginMode('registry');
      setSelectedAssetId(initialOriginAsset.asset_id);
    }
  }, [initialOriginAsset]);

  const handleCalculateRoute = async () => {
    setLoading(true);
    try {
      let sLat = 19.8210;
      let sLng = 85.8450;

      if (originMode === 'registry' && selectedAssetId) {
        const found = assets.find(a => a.asset_id === selectedAssetId);
        if (found) {
          sLat = found.latitude;
          sLng = found.longitude;
        }
      } else {
        const s = startCoordsMap[startPreset];
        sLat = s.lat;
        sLng = s.lng;
      }

      const e = endCoordsMap[endPoint];
      const res = await api.calculateOptimalRoute({
        start_lat: sLat,
        start_lng: sLng,
        end_lat: e.lat,
        end_lng: e.lng,
        avoid_high_flood: avoidFlood,
        vehicle_type: vehicleType
      });
      setRoute(res);
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    handleCalculateRoute();
  }, [originMode, startPreset, selectedAssetId, endPoint, avoidFlood, vehicleType]);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <RouteIcon className="w-7 h-7 text-slate-800" />
          <span>Emergency Evacuation Route Optimization</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dijkstra multi-hazard pathfinding penalizing storm-surge coastal breach sectors and flooded highway culverts
        </p>
      </div>

      {/* Origin / Destination & Settings Card - Clean White Design */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Origin Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Evacuation Origin</span>
              </label>
              <div className="flex gap-1 text-[10px]">
                <button
                  onClick={() => setOriginMode('preset')}
                  className={`px-1.5 py-0.5 rounded ${originMode === 'preset' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setOriginMode('registry')}
                  className={`px-1.5 py-0.5 rounded ${originMode === 'registry' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  All ({assets.length || 87})
                </button>
              </div>
            </div>

            {originMode === 'preset' ? (
              <select
                value={startPreset}
                onChange={(e: any) => setStartPreset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
              >
                <option value="puri_hosp">Puri District Headquarters Hospital</option>
                <option value="paradip_hosp">Paradip Port Trust Hospital</option>
                <option value="konark">Konark Sub-Divisional Hospital</option>
              </select>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium truncate"
              >
                <option value="">Select monitored asset...</option>
                {(assets || []).map((a) => (
                  <option key={a.asset_id} value={a.asset_id}>
                    {a.name} ({a.district})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Safe Destination Sanctuary</span>
            </label>
            <select
              value={endPoint}
              onChange={(e: any) => setEndPoint(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
            >
              <option value="aiims">AIIMS Hospital Bhubaneswar (Inland Sanctuary)</option>
              <option value="scb">SCB Medical College Cuttack</option>
              <option value="puri_shelter">Puri Model Cyclone Shelter (Stilt Hub)</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-600" />
              <span>Vehicle Profile</span>
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-medium"
            >
              <option value="ambulance">Emergency Ambulance (Low Clearance)</option>
              <option value="high_clearance_truck">NDRF High-Clearance Heavy Truck</option>
              <option value="bus">Evacuation Bus (Passenger Transit)</option>
            </select>
          </div>

          {/* Flood Penalty Toggle */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Routing Strategy</label>
            <button
              onClick={() => setAvoidFlood(!avoidFlood)}
              className={`w-full py-2 px-3 rounded-lg border font-medium text-left flex items-center justify-between transition cursor-pointer ${
                avoidFlood
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <span className="truncate">Penalize Flooded Sectors</span>
              <span className="font-bold text-[11px]">{avoidFlood ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Route calculation optimizes path across 22 regional nodes using real-time road elevation & surge overtopping data.
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>Recalculate Route</span>
          </button>
        </div>
      </div>

      {/* Computed Route Analysis */}
      {route && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    RECOMMENDED EVACUATION PATHWAY
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {route.risk_level} Risk Level
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {route.route_name}
                </h3>
              </div>

              {/* Stats pill */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Distance</span>
                  <strong className="text-base font-bold text-slate-900 font-mono tabular-nums">{route.distance_km} km</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Est. Transit</span>
                  <strong className="text-base font-bold text-slate-900 font-mono tabular-nums">{route.estimated_travel_time_min} min</strong>
                </div>
              </div>
            </div>

            {/* Description & Hazard Warnings */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {route.hazard_summary}
              </div>

              {/* Route Waypoints list */}
              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">Sequential Transit Corridors:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(route.path_nodes || []).map((node, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{node}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison with Coastal Route */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1 text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Alternative Coastal Marine Drive Warning</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/80">
                  Coastal Marine Drive is 12 km shorter but suffers catastrophic storm-surge breaching between km 18-24. 
                  Travel time along the coast is estimated at 190+ minutes due to fallen poles and waterlogging. The inland bypass corridor via NH-316 is strongly advised.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
