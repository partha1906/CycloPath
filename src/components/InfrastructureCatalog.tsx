import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';
import { InfrastructureAsset } from '../types';
import { Language, translations } from '../i18n/translations';

interface CatalogProps {
  assets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  language: Language;
}

export const InfrastructureCatalog: React.FC<CatalogProps> = ({
  assets,
  onSelectAsset,
  language
}) => {
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  const safeAssets = Array.isArray(assets) ? assets : [];

  // Distinct districts
  const districts = Array.from(new Set(safeAssets.map(a => a.district))).filter(Boolean).sort();

  // Filtered assets
  const filtered = safeAssets.filter(a => {
    if (selectedType !== 'all' && a.asset_type !== selectedType) return false;
    if (selectedDistrict !== 'all' && a.district !== selectedDistrict) return false;
    if (selectedRisk !== 'all' && a.risk_assessment?.risk_category.toLowerCase() !== selectedRisk.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.asset_id.toLowerCase().includes(q) || a.district.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-slate-800" />
            <span>Infrastructure Risk Registry</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time vulnerability index and explainable hazard metrics across {safeAssets.length} coastal assets
          </p>
        </div>

        <div className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs self-start sm:self-auto">
          Showing <strong className="text-slate-900 font-bold">{filtered.length}</strong> of {assets.length} Assets
        </div>
      </div>

      {/* Filters & Search Toolbar - Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={t.search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-slate-900 placeholder-slate-400 outline-none w-full text-xs font-medium"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none cursor-pointer font-medium"
        >
          <option value="all">{t.type_all}</option>
          <option value="hospital">{t.type_hospital}</option>
          <option value="power_station">{t.type_power}</option>
          <option value="bridge">{t.type_bridge}</option>
          <option value="road">{t.type_road}</option>
          <option value="school_shelter">{t.type_shelter}</option>
          <option value="water_facility">{t.type_water}</option>
          <option value="port">{t.type_port}</option>
        </select>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none cursor-pointer font-medium"
        >
          <option value="all">{t.filter_district}</option>
          {(districts || []).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Risk Level Filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none cursor-pointer font-medium"
        >
          <option value="all">{t.filter_risk}</option>
          <option value="critical">{t.risk_critical} (&gt;80)</option>
          <option value="high">{t.risk_high} (61-80)</option>
          <option value="moderate">{t.risk_moderate} (31-60)</option>
          <option value="low">{t.risk_low} (&lt;30)</option>
        </select>
      </div>

      {/* Asset Table - Clean White Design */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3.5 px-4">ASSET DETAILS</th>
                <th className="py-3.5 px-4">TYPE</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4">SPECIFICATIONS</th>
                <th className="py-3.5 px-4">VULNERABILITY</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filtered || []).map((asset) => {
                const score = asset.risk_assessment?.overall_vulnerability_score || 0;
                const cat = asset.risk_assessment?.risk_category || 'Moderate';
                
                return (
                  <tr 
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-slate-950 transition">{asset.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{asset.asset_id} · Cap: {asset.capacity.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {asset.asset_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <div className="font-medium">{asset.district}, {asset.state}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{asset.latitude.toFixed(3)}°N, {asset.longitude.toFixed(3)}°E</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      <div>Elev: {asset.elevation_m}m · Coast: {asset.distance_to_coast_km}km</div>
                      <div className={`mt-0.5 font-medium ${asset.backup_power ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {asset.backup_power ? '✓ Backup Generator' : '✗ No Generator'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs tabular-nums ${
                        score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : score >= 30 ? 'badge-moderate' : 'badge-low'
                      }`}>
                        {score}/100 · {cat}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <span>Explain SHAP</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
