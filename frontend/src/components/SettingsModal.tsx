import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Check, 
  RotateCcw, 
  Sliders, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightsUpdated?: () => void;
  userRole?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onWeightsUpdated,
  userRole = 'Disaster_Authority'
}) => {
  const isAuthorized = userRole === 'Disaster_Authority' || userRole === 'Municipal_Officer';
  const [weights, setWeights] = useState({
    cyclone_exposure: 0.25,
    flood_exposure: 0.20,
    storm_surge: 0.20,
    infrastructure_vulnerability: 0.15,
    accessibility_risk: 0.10,
    population_criticality: 0.10
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getRiskWeights().then(w => {
        if (w) setWeights(w as any);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSum = Math.round(
    (weights.cyclone_exposure +
     weights.flood_exposure +
     weights.storm_surge +
     weights.infrastructure_vulnerability +
     weights.accessibility_risk +
     weights.population_criticality) * 100
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateRiskWeights(weights);
      setSaveSuccess(true);
      if (onWeightsUpdated) onWeightsUpdated();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save weights:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeights({
      cyclone_exposure: 0.25,
      flood_exposure: 0.20,
      storm_surge: 0.20,
      infrastructure_vulnerability: 0.15,
      accessibility_risk: 0.10,
      population_criticality: 0.10
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0c1220] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#11192e] to-[#0d1424] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-base">Risk Engine Formula Configuration</h3>
              <p className="text-[11px] text-slate-400">Rebalance multi-hazard weights dynamically</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d18] border border-slate-800">
            <span>Cumulative Weight Balance:</span>
            <strong className={`font-mono text-sm ${totalSum === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalSum}% {totalSum !== 100 && '(Normalized Automatically)'}
            </strong>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Cyclone Wind Exposure</span>
                <strong className="font-mono text-cyan-400">{Math.round(weights.cyclone_exposure * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.cyclone_exposure}
                onChange={(e) => setWeights({ ...weights, cyclone_exposure: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Flood Inundation Exposure</span>
                <strong className="font-mono text-sky-400">{Math.round(weights.flood_exposure * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.flood_exposure}
                onChange={(e) => setWeights({ ...weights, flood_exposure: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Storm Surge Inundation</span>
                <strong className="font-mono text-indigo-400">{Math.round(weights.storm_surge * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.storm_surge}
                onChange={(e) => setWeights({ ...weights, storm_surge: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Infrastructure Fragility & Power Backup</span>
                <strong className="font-mono text-amber-400">{Math.round(weights.infrastructure_vulnerability * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.infrastructure_vulnerability}
                onChange={(e) => setWeights({ ...weights, infrastructure_vulnerability: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Road Accessibility Risk</span>
                <strong className="font-mono text-yellow-400">{Math.round(weights.accessibility_risk * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.accessibility_risk}
                onChange={(e) => setWeights({ ...weights, accessibility_risk: parseFloat(e.target.value) })}
                className="w-full accent-yellow-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Population Criticality</span>
                <strong className="font-mono text-emerald-400">{Math.round(weights.population_criticality * 100)}%</strong>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.population_criticality}
                onChange={(e) => setWeights({ ...weights, population_criticality: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Authorization Notice if citizen */}
        {!isAuthorized && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Read-Only Mode: Modifying multi-hazard formula weights requires Disaster Management Authority or Municipal Officer credentials.</span>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#090d18] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={!isAuthorized}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standards</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !isAuthorized}
            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition ${
              isAuthorized 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {saving ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved & Recalculated!' : isAuthorized ? 'Apply Risk Weights' : 'Restricted (Admin Only)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
