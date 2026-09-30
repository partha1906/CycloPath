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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>Multi-Hazard "What-If" Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Recompute infrastructure vulnerability scores and emergency priorities under dynamic meteorological changes
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 self-start transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Simulator Controls & Sliders */}
      <div className="glass-panel p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wind Speed Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-[#090d18] border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Peak Sustained Wind Speed</span>
              </span>
              <strong className="text-cyan-400 font-mono text-sm">{windSpeed} km/h</strong>
            </div>
            <input
              type="range"
              min="80"
              max="280"
              step="5"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>80 km/h (Cyclonic Storm)</span>
              <span>280 km/h (Super Cyclone)</span>
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-[#090d18] border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>24-Hour Cumulative Rainfall</span>
              </span>
              <strong className="text-sky-400 font-mono text-sm">{rainfall} mm</strong>
            </div>
            <input
              type="range"
              min="50"
              max="700"
              step="10"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50 mm (Moderate)</span>
              <span>700 mm (Catastrophic)</span>
            </div>
          </div>

          {/* Storm Surge Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-[#090d18] border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-indigo-400" />
                <span>Storm Surge Inundation Height</span>
              </span>
              <strong className="text-indigo-400 font-mono text-sm">+{stormSurge} m</strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="9.0"
              step="0.5"
              value={stormSurge}
              onChange={(e) => setStormSurge(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5 m (Low Tide)</span>
              <span>9.0 m (Extreme Breach)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 hidden sm:block">
            Adjusting parameters simulates non-linear impacts on hospitals, substations, and evacuation access.
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/40 flex items-center gap-2 transition ml-auto"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>SIMULATE IMPACT</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Display (Before vs After) */}
      {simResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 space-y-2 border-slate-700">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Operational Baseline</span>
              <div className="text-3xl font-black text-slate-300">
                {simResult.baseline_critical_count} <span className="text-xs font-normal text-slate-500">critical assets</span>
              </div>
              <p className="text-[11px] text-slate-500">Standard forecast conditions</p>
            </div>

            <div className="glass-panel p-5 space-y-2 border-red-500/50 bg-red-950/20">
              <span className="text-xs text-red-300 font-semibold uppercase tracking-wider">Simulated Scenario</span>
              <div className="text-3xl font-black text-red-400">
                {simResult.critical_assets_count} <span className="text-xs font-normal text-red-300/60">critical assets</span>
              </div>
              <p className="text-[11px] text-red-300">
                High Risk Facilities: <strong>{simResult.high_risk_assets_count}</strong>
              </p>
            </div>

            <div className="glass-panel p-5 space-y-2 border-amber-500/50 bg-amber-950/20">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Risk Increase Delta</span>
              <div className="text-3xl font-black text-amber-400 flex items-center gap-2">
                <span>+{simResult.critical_increase_pct}%</span>
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-[11px] text-amber-200/80">
                Affected Population: ~{simResult.population_affected_est.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Newly Critical Infrastructure List */}
          {simResult.newly_critical_assets.length > 0 && (
            <div className="glass-panel p-5 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Newly Breached Critical Assets (Triggered by Surge & Winds)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {simResult.newly_critical_assets.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#090d18] border border-red-900/40 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{item.type.replace('_', ' ')} • {item.district}</div>
                      </div>
                      <span className="badge-critical px-2 py-0.5 rounded text-[10px] font-bold">
                        +{item.score_jump} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Baseline: {item.old_score}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <strong className="text-red-400 font-mono">Scenario: {item.new_score}/100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
            {simResult.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
