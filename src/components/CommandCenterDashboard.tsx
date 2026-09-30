import React from 'react';
import { 
  Wind, 
  Gauge, 
  Building2, 
  Zap, 
  GitFork, 
  Navigation, 
  Home, 
  CloudRain, 
  Waves, 
  ArrowUpRight,
  ShieldAlert,
  Bot,
  MapPin,
  Sliders,
  FileText
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

  // Top high-risk assets (guarded)
  const safeAssets = Array.isArray(assets) ? assets : [];
  const highRiskAssets = safeAssets
    .filter(a => a.risk_assessment?.risk_category === 'Critical' || a.risk_assessment?.risk_category === 'High')
    .sort((a, b) => (b.risk_assessment?.overall_vulnerability_score || 0) - (a.risk_assessment?.overall_vulnerability_score || 0))
    .slice(0, 6);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* 1. Real-time Cyclone Threat Banner */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">
                Active Cyclone Warning · {cyclone?.category || 'Extremely Severe Cyclonic Storm (ESCS)'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                Official IMD Red Alert
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{cyclone?.name || 'Cyclone SAMUDRA'}</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
                {cyclone?.cyclone_code || 'BOB-2026-03'}
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <p>
                <span className="text-slate-500">Projected Landfall: </span>
                <strong className="text-slate-900">{cyclone?.estimated_landfall_location || 'Between Puri and Paradip, Odisha'}</strong>
                <span className="text-slate-500"> ({cyclone?.estimated_landfall_time || 'T-6.5 Hours'})</span>
              </p>
              <span className="text-slate-300">·</span>
              <p className="text-slate-500 text-xs">
                Data calibrated with <span className="font-medium text-slate-700">IMD Doppler Radar & ISRO Bhuvan DEM</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs font-medium">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
                <span>Peak Wind</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {cyclone?.max_wind_speed_kmh || 165} <span className="text-xs font-normal text-slate-500">km/h</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs font-medium">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                <span>Pressure</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {cyclone?.central_pressure_hpa || 952} <span className="text-xs font-normal text-slate-500">hPa</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs font-medium">
                <Waves className="w-3.5 h-3.5 text-indigo-600" />
                <span>Storm Surge</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                +{cyclone?.storm_surge_potential_m || 4.5} <span className="text-xs font-normal text-slate-500">m</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 min-w-[110px]">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-xs font-medium">
                <CloudRain className="w-3.5 h-3.5 text-teal-600" />
                <span>24h Rainfall</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {cyclone?.rainfall_24h_mm || 340} <span className="text-xs font-normal text-slate-500">mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Critical Infrastructure Impact Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            Monitored Infrastructure Vulnerability Summary
          </h2>
          <span className="text-xs text-slate-500">
            {summary?.total_monitored || assets.length} Assets Monitored Across Coastal Belt
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => onNavigateTab('infrastructure')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-xs cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Hospitals</span>
              <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-rose-600">{summary?.hospitals_at_risk || 4}</span>
              <span className="text-xs font-medium text-slate-500">high risk</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>ICU & Trauma facilities</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('infrastructure')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Power Substations</span>
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-amber-600">{summary?.power_stations_at_risk || 3}</span>
              <span className="text-xs font-medium text-slate-500">high risk</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Saline flashover threats</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('infrastructure')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-xs cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Bridges & Links</span>
              <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                <GitFork className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-orange-600">{summary?.bridges_at_risk || 1}</span>
              <span className="text-xs font-medium text-slate-500">high risk</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Scour & flood pressure</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('infrastructure')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-yellow-400 hover:shadow-xs cursor-pointer transition group"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Arterial Roads</span>
              <div className="p-1.5 rounded-md bg-yellow-50 text-yellow-700">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-yellow-600">{summary?.roads_at_risk || 6}</span>
              <span className="text-xs font-medium text-slate-500">high risk</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Low-lying culverts</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('infrastructure')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs cursor-pointer transition group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold">Active Shelters</span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-emerald-600">{summary?.shelters_active || 20}</span>
              <span className="text-xs font-medium text-slate-500">ready</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>45,000+ Capacity</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Priority Assets Table & Quick AI Situation Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Risk Infrastructure Prioritization */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Priority Vulnerable Facilities</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by multi-factor physics & machine-learning vulnerability score (0-100)
              </p>
            </div>

            <button 
              onClick={() => onNavigateTab('infrastructure')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>View All ({safeAssets.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-3.5">FACILITY NAME</th>
                  <th className="py-3 px-3.5">TYPE</th>
                  <th className="py-3 px-3.5">DISTRICT</th>
                  <th className="py-3 px-3.5">VULNERABILITY</th>
                  <th className="py-3 px-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(highRiskAssets || []).map((asset) => {
                  const score = asset.risk_assessment?.overall_vulnerability_score || 0;
                  const cat = asset.risk_assessment?.risk_category || 'Moderate';
                  
                  return (
                    <tr 
                      key={asset.id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => onSelectAsset(asset)}
                    >
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-900">{asset.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{asset.asset_id}</div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="capitalize text-slate-600">
                          {asset.asset_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600">
                        {asset.district}, {asset.state}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs tabular-nums ${
                          score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : 'badge-moderate'
                        }`}>
                          {score}/100 · {cat}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAsset(asset);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-medium text-xs transition"
                        >
                          Explain SHAP
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: AI Situation Brief & Direct Action Triggers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Disaster Advisory Brief</h3>
                <p className="text-[11px] text-slate-500">Autonomous Decision-Support Synthesis</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3">
              <p>
                <strong className="text-slate-900">Critical Threat Assessment:</strong> Severe Cyclone SAMUDRA tracking NNW towards Puri-Jagatsinghpur corridor. 
                Sustained wind speeds of {cyclone?.max_wind_speed_kmh || 165} km/h and coastal storm surge of up to +{cyclone?.storm_surge_potential_m || 4.5}m.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="font-semibold text-slate-800">Priority Operational Directives:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                  <li><strong>Hospital Power:</strong> Test autonomous diesel backups; move pharmacy reserves above Level 1.</li>
                  <li><strong>Grid Protection:</strong> Prepare coastal 33kV line isolation to avoid saline flashovers.</li>
                  <li><strong>Evacuation Corridor:</strong> Restrict traffic on coastal Marine Drive; route emergency convoys via inland NH-316.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigateTab('ai_agent')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Bot className="w-4 h-4" />
              <span>Query AI Response Agent</span>
            </button>

            <button
              onClick={() => onNavigateTab('risk_map')}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-slate-600" />
              <span>Explore Interactive Risk Map</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Launch What-If Scenario Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. District Vulnerability Breakdown Matrix */}
      {summary?.district_breakdown && summary.district_breakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">District Vulnerability Matrix</h3>
              <p className="text-xs text-slate-500">Aggregate infrastructure risk scores across coastal districts</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Official Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(summary.district_breakdown || []).slice(0, 4).map((d) => (
              <div key={d.district} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{d.district}</span>
                  <span className="text-xs text-slate-500">{d.state}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Avg Risk Score:</span>
                  <span className={`font-bold tabular-nums ${d.avg_vulnerability_score >= 70 ? 'text-rose-600' : d.avg_vulnerability_score >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {d.avg_vulnerability_score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${d.avg_vulnerability_score >= 70 ? 'bg-rose-500' : d.avg_vulnerability_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, d.avg_vulnerability_score)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{d.total_assets} facilities</span>
                  <span className="text-rose-600 font-semibold">{d.critical_assets} critical</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
