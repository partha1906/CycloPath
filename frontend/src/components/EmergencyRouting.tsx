import React, { useState } from 'react';
import { 
  Route as RouteIcon, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { RouteResponse } from '../types';
import { api } from '../services/api';

export const EmergencyRouting: React.FC = () => {
  const [startPoint, setStartPoint] = useState<'puri_hosp' | 'paradip_hosp' | 'konark'>('puri_hosp');
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

  const handleCalculateRoute = async () => {
    setLoading(true);
    try {
      const s = startCoordsMap[startPoint];
      const e = endCoordsMap[endPoint];
      const res = await api.calculateOptimalRoute({
        start_lat: s.lat,
        start_lng: s.lng,
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

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <RouteIcon className="w-6 h-6 text-cyan-400" />
          <span>Emergency Evacuation Route Optimization</span>
        </h2>
        <p className="text-xs text-slate-400">
          Dijkstra multi-hazard pathfinding penalizing storm-surge coastal breach sectors and flooded highway culverts
        </p>
      </div>

      {/* Origin / Destination & Settings Card */}
      <div className="glass-panel p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Evacuation Origin (Vulnerable Asset)</span>
            </label>
            <select
              value={startPoint}
              onChange={(e: any) => setStartPoint(e.target.value)}
              className="w-full bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value="puri_hosp">Puri District Headquarters Hospital</option>
              <option value="paradip_hosp">Paradip Port Trust Hospital</option>
              <option value="konark">Konark Sub-Divisional Hospital</option>
            </select>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Destination Sanctuary</span>
            </label>
            <select
              value={endPoint}
              onChange={(e: any) => setEndPoint(e.target.value)}
              className="w-full bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value="aiims">AIIMS Bhubaneswar (Elevated 42m)</option>
              <option value="scb">SCB Medical College Cuttack</option>
              <option value="puri_shelter">Puri Model Multi-Purpose Cyclone Shelter</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Convoy Vehicle Category</span>
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value="ambulance">Emergency Medical Ambulance</option>
              <option value="heavy_truck">NDRF Heavy Rescue Truck</option>
              <option value="response_suv">Incident Commander 4x4 SUV</option>
            </select>
          </div>

          {/* Flood Penalty Toggle */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#090d18] border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidFlood}
                onChange={(e) => setAvoidFlood(e.target.checked)}
                className="accent-cyan-500 rounded cursor-pointer"
              />
              <span className="font-medium text-slate-300">Penalize High Storm Surge Zones</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleCalculateRoute}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>Calculate Safest Corridor</span>
        </button>
      </div>

      {/* Route Output Results */}
      {route && (
        <div className="glass-panel p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>OPTIMIZED EMERGENCY EVACUATION PATH</span>
                </span>
                <span className="badge-low px-2 py-0.5 rounded text-[10px] font-bold">
                  {route.risk_level}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {route.route_name}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">TOTAL DISTANCE</span>
                <strong className="text-white text-base">{route.distance_km} km</strong>
              </div>

              <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">EST. TRAVEL TIME</span>
                <strong className="text-cyan-400 text-base">{route.estimated_travel_time_min} mins</strong>
              </div>
            </div>
          </div>

          {/* Waypoints Traversal Chain */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Waypoints Sequence:</span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {route.waypoints.map((wp, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-3 py-1.5 rounded-lg bg-[#090d18] border border-slate-800 text-slate-300 font-medium">
                    {wp}
                  </div>
                  {idx < route.waypoints.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Safety Advisories */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Safety & Ground Operations Notes:</span>
            <div className="space-y-1.5 text-xs text-slate-300">
              {route.safety_notes.map((note, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-2 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
