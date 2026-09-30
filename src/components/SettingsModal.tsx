import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Check, 
  RotateCcw, 
  Sliders
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-slate-900">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Risk Engine Formula Configuration</h3>
              <p className="text-xs text-slate-500">Rebalance multi-hazard weights dynamically</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Container */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isAuthorized && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Clearance Notice: You are viewing in read-only mode. Authority clearance required to save changes.
            </div>
          )}

          {/* Sum tracker */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Total Factor Weight Sum:</span>
            <span className={`font-bold font-mono text-sm ${totalSum === 100 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {totalSum}% {totalSum === 100 ? '(Balanced 1.0)' : '(Must equal 100%)'}
            </span>
          </div>

          {/* Factor Sliders */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Cyclone Proximity & Gale Wind Exposure</span>
                <span className="font-mono text-slate-900">{Math.round(weights.cyclone_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.cyclone_exposure}
                onChange={(e) => setWeights({ ...weights, cyclone_exposure: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Precipitation & Flash Flood Inundation</span>
                <span className="font-mono text-slate-900">{Math.round(weights.flood_exposure * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.flood_exposure}
                onChange={(e) => setWeights({ ...weights, flood_exposure: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Astronomical Storm Surge & Sea Proximity</span>
                <span className="font-mono text-slate-900">{Math.round(weights.storm_surge * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.storm_surge}
                onChange={(e) => setWeights({ ...weights, storm_surge: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Structural Vulnerability (Building Age, Backup Power)</span>
                <span className="font-mono text-slate-900">{Math.round(weights.infrastructure_vulnerability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.infrastructure_vulnerability}
                onChange={(e) => setWeights({ ...weights, infrastructure_vulnerability: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Accessibility & Road Cut-Off Risk</span>
                <span className="font-mono text-slate-900">{Math.round(weights.accessibility_risk * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.accessibility_risk}
                onChange={(e) => setWeights({ ...weights, accessibility_risk: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Population Criticality & Bed Capacity</span>
                <span className="font-mono text-slate-900">{Math.round(weights.population_criticality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                disabled={!isAuthorized}
                value={weights.population_criticality}
                onChange={(e) => setWeights({ ...weights, population_criticality: Number(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={!isAuthorized}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isAuthorized || saving || totalSum !== 100}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Weights Applied!</span>
              </>
            ) : (
              <span>Save & Recalculate Platform</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
