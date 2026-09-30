import React from 'react';
import { 
  Wind, 
  Gauge, 
  Compass, 
  Clock, 
  ShieldAlert, 
  Building2, 
  Zap, 
  GitFork, 
  Navigation, 
  Home, 
  CloudRain, 
  Waves, 
  Users, 
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Bot,
  ExternalLink
} from 'lucide-react';
import { Cyclone, RiskSummary, InfrastructureAsset } from '../types';
import { Language, translations } from '../i18n/translations';

interface DashboardProps {
  cyclone: Cyclone | null;
  summary: RiskSummary | null;
  assets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const CommandCenterDashboard: React.FC<DashboardProps> = ({
  cyclone,
  summary,
  assets,
  onSelectAsset,
  onNavigateTab,
  language
}) => {
  const t = translations[language];

  // Top high-risk assets
  const highRiskAssets = assets
    .filter(a => a.risk_assessment?.risk_category === 'Critical' || a.risk_assessment?.risk_category === 'High')
    .sort((a, b) => (b.risk_assessment?.overall_vulnerability_score || 0) - (a.risk_assessment?.overall_vulnerability_score || 0))
    .slice(0, 5);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Real-time Cyclone Status Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#11192e] via-[#0d1424] to-[#090d18] border border-cyan-500/30 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
                ACTIVE CYCLONIC THREAT • {cyclone?.category || 'Extremely Severe Cyclonic Storm (ESCS)'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-300">
                Official IMD Stage IV Red Alert
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <span>{cyclone?.name || 'Cyclone SAMUDRA'}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {cyclone?.cyclone_code || 'BOB-2026-03'}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
              <p>
                <span>Projected Landfall: </span>
                <strong className="text-cyan-300">{cyclone?.estimated_landfall_location || 'Between Puri and Paradip, Odisha'}</strong>
                <span className="text-slate-400"> ({cyclone?.estimated_landfall_time || 'T-6.5 Hours'})</span>
              </p>
              <span className="text-slate-500">•</span>
              <p className="text-slate-400 text-[11px]">
                Official Source: <span className="text-slate-200">IMD RSMC New Delhi Bulletin #14</span>
              </p>
            </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs">
            <div className="bg-[#090d18]/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Peak Wind</span>
              </div>
              <div className="text-lg font-bold text-white">
                {cyclone?.max_wind_speed_kmh || 165} <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
            </div>

            <div className="bg-[#090d18]/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>Pressure</span>
              </div>
              <div className="text-lg font-bold text-white">
                {cyclone?.central_pressure_hpa || 952} <span className="text-xs font-normal text-slate-400">hPa</span>
              </div>
            </div>

            <div className="bg-[#090d18]/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Waves className="w-3.5 h-3.5 text-indigo-400" />
                <span>Storm Surge</span>
              </div>
              <div className="text-lg font-bold text-white">
                +{cyclone?.storm_surge_potential_m || 4.5} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
            </div>

            <div className="bg-[#090d18]/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>24h Rainfall</span>
              </div>
              <div className="text-lg font-bold text-white">
                {cyclone?.rainfall_24h_mm || 340} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Critical Infrastructure Impact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => onNavigateTab('infrastructure')}
          className="glass-panel p-4 cursor-pointer hover:border-red-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Hospitals</span>
            <Building2 className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-red-400">{summary?.hospitals_at_risk || 4}</span>
            <span className="text-xs text-slate-500">at risk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Critical beds: 1,420</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('infrastructure')}
          className="glass-panel p-4 cursor-pointer hover:border-amber-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Power Stations</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-amber-400">{summary?.power_stations_at_risk || 3}</span>
            <span className="text-xs text-slate-500">at risk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Saline surge breach</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('infrastructure')}
          className="glass-panel p-4 cursor-pointer hover:border-orange-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Bridges</span>
            <GitFork className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-orange-400">{summary?.bridges_at_risk || 1}</span>
            <span className="text-xs text-slate-500">at risk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Hydrodynamic scour</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('infrastructure')}
          className="glass-panel p-4 cursor-pointer hover:border-yellow-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Roads & Arteries</span>
            <Navigation className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-yellow-400">{summary?.roads_at_risk || 6}</span>
            <span className="text-xs text-slate-500">at risk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Marine Drive overtopping</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('infrastructure')}
          className="glass-panel p-4 cursor-pointer hover:border-emerald-500/50 transition group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Cyclone Shelters</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-emerald-400">{summary?.shelters_active || 20}</span>
            <span className="text-xs text-slate-500">ready</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Capacity: 45,000</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Priority Assets Table & Quick AI Situation Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Risk Infrastructure Ranking */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>High-Risk Infrastructure Prioritization</span>
              </h3>
              <p className="text-xs text-slate-400">Ranked by multi-factor vulnerability score (0-100)</p>
            </div>

            <button 
              onClick={() => onNavigateTab('infrastructure')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All ({assets.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d18] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ASSET</th>
                  <th className="py-2.5 px-3 font-semibold">TYPE</th>
                  <th className="py-2.5 px-3 font-semibold">DISTRICT</th>
                  <th className="py-2.5 px-3 font-semibold">SCORE</th>
                  <th className="py-2.5 px-3 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {highRiskAssets.map((asset) => {
                  const score = asset.risk_assessment?.overall_vulnerability_score || 0;
                  const cat = asset.risk_assessment?.risk_category || 'Moderate';
                  
                  return (
                    <tr 
                      key={asset.id}
                      className="hover:bg-[#121929] transition cursor-pointer"
                      onClick={() => onSelectAsset(asset)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{asset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{asset.asset_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize text-slate-300">
                          {asset.asset_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {asset.district}, {asset.state}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : 'badge-moderate'
                        }`}>
                          {score}/100 • {cat}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAsset(asset);
                          }}
                          className="px-2.5 py-1 rounded bg-[#1e273e] hover:bg-cyan-600 text-slate-200 hover:text-white font-medium text-[11px] transition"
                        >
                          Inspect SHAP
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: AI Situation Brief & Quick Actions */}
        <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Cyclopath AI Situation Brief</h3>
                <p className="text-[10px] text-slate-400">Synthesized Decision-Support Guidance</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <strong>Critical Priority:</strong> Severe Cyclone SAMUDRA tracking NNW towards Puri-Jagatsinghpur corridor. 
                16 infrastructure facilities breach High Vulnerability threshold.
              </p>
              <p>
                <strong>Immediate Directives:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Puri District Hospital: Verify 72h auxiliary generator fuel & move pharmacy above ground.</li>
                <li>Paradip Substation: Prepare 33kV coastal feeder isolation.</li>
                <li>Marine Drive Road: Divert logistics to inland NH-316.</li>
              </ul>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigateTab('ai_agent')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Generate Full AI Emergency Plan</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full py-2.5 rounded-xl bg-[#161f33] hover:bg-[#1e2a44] text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Launch What-If Scenario Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
