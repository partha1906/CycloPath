import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Building2, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Waves,
  Navigation
} from 'lucide-react';
import { InfrastructureAsset } from '../types';

interface AssetDetailModalProps {
  asset: InfrastructureAsset | null;
  onClose: () => void;
  onPlanRouteForAsset?: (asset: InfrastructureAsset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onPlanRouteForAsset
}) => {
  if (!asset) return null;

  const ra = asset.risk_assessment;
  const score = ra?.overall_vulnerability_score || 0;
  const cat = ra?.risk_category || 'Moderate';
  const shapFactors = ra?.shap_factors || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-xl h-full max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-slate-900">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : 'badge-moderate'
              }`}>
                VULNERABILITY: {cat.toUpperCase()} · {score}/100
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                AI Decision-Support
              </span>
              <span className="text-[11px] font-mono text-slate-500">{asset.asset_id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {asset.name}
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{asset.district}, {asset.state}</span>
              <span>·</span>
              <span className="capitalize">{asset.asset_type.replace('_', ' ')}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Hazard Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Elevation</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{asset.elevation_m} m</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Coast Distance</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{asset.distance_to_coast_km} km</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Backup Power</span>
              <span className={`font-bold text-sm mt-0.5 block ${asset.backup_power ? 'text-emerald-700' : 'text-rose-700'}`}>
                {asset.backup_power ? 'Yes (DG Set)' : 'No Generator'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Capacity</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">{asset.capacity.toLocaleString()}</span>
            </div>
          </div>

          {/* Explainable AI SHAP Factor Attribution */}
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-700" />
                <span>Explainable AI Risk Decomposition (SHAP Values)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Relative contribution of physics factors and structural vulnerabilities to the composite vulnerability score
              </p>
            </div>

            <div className="space-y-2.5">
              {shapFactors.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{f.factor_name}</span>
                    <span className="font-bold font-mono text-slate-700 tabular-nums">+{f.contribution_score} pts ({f.percentage_impact}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-800 h-full rounded-full"
                      style={{ width: `${Math.min(100, f.percentage_impact * 2.2)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Operational Directives */}
          {ra?.recommended_actions && ra.recommended_actions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-slate-900 text-sm">Priority Mitigation Directives:</h3>
              <div className="space-y-2 text-xs text-slate-700">
                {(ra.recommended_actions || []).map((act, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span className="font-bold text-slate-900 shrink-0">{i + 1}.</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>

          {onPlanRouteForAsset && (
            <button
              onClick={() => {
                onPlanRouteForAsset(asset);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Calculate Safe Evacuation Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
