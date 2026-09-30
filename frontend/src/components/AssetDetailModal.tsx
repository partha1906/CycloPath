import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Cpu,
  Zap,
  MapPin,
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
  const mlPred = asset.ml_prediction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-xl h-full max-h-[92vh] bg-[#0c1220] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#11192e] to-[#0d1424] border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : 'badge-moderate'
              }`}>
                VULNERABILITY: {cat.toUpperCase()} • {score}/100
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                AI Decision-Support
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Demo Simulation
              </span>
              <span className="text-[11px] font-mono text-slate-400">{asset.asset_id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              {asset.name}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{asset.district}, {asset.state}</span>
              <span>•</span>
              <span className="capitalize">{asset.asset_type.replace('_', ' ')}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Key Hazard Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Elevation</span>
              <span className="font-bold text-white text-sm">{asset.elevation_m} m</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Coast Distance</span>
              <span className="font-bold text-white text-sm">{asset.distance_to_coast_km} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Backup Power</span>
              <span className={`font-bold text-sm ${asset.backup_power ? 'text-emerald-400' : 'text-red-400'}`}>
                {asset.backup_power ? 'Yes (DG Set)' : 'No Backup'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Capacity / Beds</span>
              <span className="font-bold text-white text-sm">{asset.capacity.toLocaleString()}</span>
            </div>
          </div>

          {/* Explainable AI: SHAP Factor Attribution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Explainable AI: Why is this asset {cat.toLowerCase()} risk?</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">SHAP TreeAttribution</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080d18] border border-slate-800 space-y-2.5">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{ra?.ai_explanation || 'Assessment complete.'}"
              </p>

              {/* Factor Contribution Bars */}
              <div className="space-y-2 pt-1">
                {shapFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{factor.factor}</span>
                      <span className="font-bold text-cyan-400 font-mono">+{factor.contribution} pts</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, factor.contribution * 3.5)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{factor.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Learning Model Validation */}
          {mlPred && (
            <div className="p-3.5 rounded-xl bg-[#080d18] border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ML Surrogate Inference (Random Forest)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">R² = {mlPred.model_metadata.validation_r2}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Model Predicted Risk Score:</span>
                <strong className="text-white text-sm font-mono">{mlPred.ml_predicted_score}/100</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Action Priority Tier:</span>
                <span className="font-bold text-red-400">Tier {mlPred.priority_level} (Immediate)</span>
              </div>
            </div>
          )}

          {/* Actionable Emergency Directives */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Emergency Actions</span>
            </h3>

            <div className="space-y-1.5">
              {ra?.recommended_actions && ra.recommended_actions.length > 0 ? (
                ra.recommended_actions.map((action, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-start gap-2">
                    <span className="font-bold text-emerald-400 text-xs font-mono">{i + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No emergency interventions required currently.</div>
              )}
            </div>
          </div>

          {/* Operational Decision-Support & IMD Warning Distinction */}
          <div className="p-3.5 rounded-xl bg-[#090d19] border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Operational Vulnerability Metric • Distinct from Official IMD Bulletins</span>
            </div>
            <p className="leading-relaxed">
              This score evaluates physical and operational infrastructure vulnerability (0–100) based on local elevation, tidal surge modeling, and power dependency. 
              <strong className="text-slate-200"> It does not establish an official IMD warning stage or government evacuation order.</strong> 
              Official meteorological cyclone warnings (Stage I–IV Alerts) are issued strictly at the regional/district level by the India Meteorological Department (IMD) and State Disaster Management Authorities (SDMA).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#090d18] border-t border-slate-800 flex items-center justify-between gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Close
          </button>

          {onPlanRouteForAsset && (
            <button
              onClick={() => {
                onPlanRouteForAsset(asset);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Optimize Safe Route to Facility</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
