import React, { useState } from 'react';
import { 
  Sliders, 
  Wind, 
  CloudRain, 
  Waves, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Building2,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { SimulationResult, InfrastructureAsset } from '../types';
import { api } from '../services/api';

interface SimulatorProps {
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const ScenarioSimulator: React.FC<SimulatorProps> = ({ onSelectAsset }) => {
  const [windSpeed, setWindSpeed] = useState(185);
  const [rainfall, setRainfall] = useState(420);
  const [stormSurge, setStormSurge] = useState(5.5);
  const [pathShift, setPathShift] = useState(0);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        wind_speed_kmh: windSpeed,
        rainfall_mm: rainfall,
        storm_surge_m: stormSurge,
        path_shift_km: pathShift
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWindSpeed(165);
    setRainfall(340);
    setStormSurge(4.5);
    setPathShift(0);
    setSimResult(null);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sliders className="w-7 h-7 text-slate-800" />
            <span>Multi-Hazard "What-If" Scenario Simulator</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Recompute infrastructure vulnerability scores and emergency priorities under dynamic meteorological changes
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 self-start shadow-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Simulator Controls & Sliders - Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wind Speed Slider */}
          <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-700" />
                <span>Peak Sustained Wind Speed</span>
              </span>
              <strong className="text-slate-900 font-mono text-base tabular-nums">{windSpeed} km/h</strong>
            </div>
            <input
              type="range"
              min="80"
              max="280"
              step="5"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>80 km/h (Moderate)</span>
              <span>280 km/h (Super Cyclone)</span>
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-slate-700" />
                <span>24h Cumulative Precipitation</span>
              </span>
              <strong className="text-slate-900 font-mono text-base tabular-nums">{rainfall} mm</strong>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              step="10"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>50 mm (Light)</span>
              <span>600 mm (Extreme Flood)</span>
            </div>
          </div>

          {/* Storm Surge Slider */}
          <div className="space-y-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <Waves className="w-4 h-4 text-slate-700" />
                <span>Coastal Storm Surge Height</span>
              </span>
              <strong className="text-slate-900 font-mono text-base tabular-nums">+{stormSurge.toFixed(1)} m</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={stormSurge}
              onChange={(e) => setStormSurge(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1.0 m (Moderate Surge)</span>
              <span>8.0 m (Catastrophic)</span>
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Physics engine will re-evaluate all 87 coastal infrastructure nodes across Odisha swath.
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Execute Physics Simulation</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Section */}
      {simResult && (
        <div className="space-y-6">
          {/* Key Impact Deltas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Critical Assets Count</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-2 tabular-nums">
                <span>{simResult.critical_assets_count}</span>
                <span className={`text-xs font-semibold ${simResult.critical_increase_pct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {simResult.critical_increase_pct > 0 ? `+${simResult.critical_increase_pct}% surge` : 'baseline'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Baseline was {simResult.baseline_critical_count} critical facilities.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">High-Risk Assets</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 tabular-nums">
                {simResult.high_risk_assets_count}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Assets requiring enhanced standby defense.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Est. Population Inundation</span>
                <Users className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {(simResult.population_affected_est || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Estimated residents within coastal hazard footprint.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Newly Critical Transitions</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-extrabold text-rose-600 tabular-nums">
                {(simResult.newly_critical_assets || []).length}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Facilities exceeding critical vulnerability thresholds.
              </p>
            </div>
          </div>

          {/* Newly Critical Facilities Table */}
          {simResult.newly_critical_assets && simResult.newly_critical_assets.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Newly Breached Critical Facilities (Simulated Surge)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  These assets were moderate/high under baseline conditions but crossed into Critical status under this scenario.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">FACILITY</th>
                      <th className="py-3 px-4">TYPE</th>
                      <th className="py-3 px-4">DISTRICT</th>
                      <th className="py-3 px-4">PREVIOUS SCORE</th>
                      <th className="py-3 px-4">NEW SCORE</th>
                      <th className="py-3 px-4">DELTA JUMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(simResult.newly_critical_assets || []).map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 capitalize text-slate-600">{item.type.replace('_', ' ')}</td>
                        <td className="py-3.5 px-4 text-slate-600">{item.district}</td>
                        <td className="py-3.5 px-4 text-slate-500 tabular-nums">{item.old_score}/100</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 tabular-nums">{item.new_score}/100</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs tabular-nums">
                            +{item.score_jump} pts
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
