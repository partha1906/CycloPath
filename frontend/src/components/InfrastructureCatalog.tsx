import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  ShieldAlert, 
  Zap, 
  GitFork, 
  Navigation, 
  Home, 
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { InfrastructureAsset, AssetType, RiskCategory } from '../types';
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

  // Distinct districts
  const districts = Array.from(new Set(assets.map(a => a.district))).sort();

  // Filtered assets
  const filtered = assets.filter(a => {
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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span>Infrastructure Risk Registry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time vulnerability index across {assets.length} coastal assets
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#090d18] border border-slate-800 px-3 py-1.5 rounded-xl">
          Showing <strong className="text-cyan-400">{filtered.length}</strong> of {assets.length} Assets
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="flex items-center bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder={t.search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 outline-none w-full text-xs"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer"
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
          className="bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">{t.filter_district}</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Risk Level Filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="bg-[#090d18] border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">{t.filter_risk}</option>
          <option value="critical">{t.risk_critical} (&gt;80)</option>
          <option value="high">{t.risk_high} (61-80)</option>
          <option value="moderate">{t.risk_moderate} (31-60)</option>
          <option value="low">{t.risk_low} (&lt;30)</option>
        </select>
      </div>

      {/* Asset Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d18] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">ASSET DETAILS</th>
                <th className="py-3 px-4 font-semibold">TYPE</th>
                <th className="py-3 px-4 font-semibold">LOCATION</th>
                <th className="py-3 px-4 font-semibold">SPECS</th>
                <th className="py-3 px-4 font-semibold">VULNERABILITY</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((asset) => {
                const score = asset.risk_assessment?.overall_vulnerability_score || 0;
                const cat = asset.risk_assessment?.risk_category || 'Moderate';
                
                return (
                  <tr 
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-[#121929] transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition">{asset.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{asset.asset_id} • Cap: {asset.capacity.toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60">
                        {asset.asset_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{asset.district}, {asset.state}</div>
                      <div className="text-[10px] text-slate-500">{asset.latitude.toFixed(3)}N, {asset.longitude.toFixed(3)}E</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>Elev: {asset.elevation_m}m • Coast: {asset.distance_to_coast_km}km</div>
                      <div className={asset.backup_power ? 'text-emerald-400' : 'text-red-400'}>
                        {asset.backup_power ? '✓ Backup Power' : '✗ No Backup'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded font-bold text-xs ${
                        score >= 80 ? 'badge-critical' : score >= 60 ? 'badge-high' : score >= 30 ? 'badge-moderate' : 'badge-low'
                      }`}>
                        {score}/100 • {cat.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1a2338] hover:bg-cyan-600 text-slate-300 hover:text-white font-medium text-xs transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
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
