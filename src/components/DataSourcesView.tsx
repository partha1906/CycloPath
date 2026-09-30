import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Activity, 
  RefreshCw
} from 'lucide-react';
import { DataSource, SystemHealth } from '../types';
import { api } from '../services/api';

export const DataSourcesView: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srcs, h] = await Promise.all([
        api.getDataSources().catch(() => []),
        api.getSystemHealth().catch(() => null)
      ]);
      setSources(Array.isArray(srcs) ? srcs : []);
      setHealth(h);
    } catch (err) {
      console.error('Data sources error:', err);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Database className="w-7 h-7 text-slate-800" />
            <span>Data Sources & Observability Health</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of meteorological feeds, satellite DEM rasters, geospatial topologies, and backend microservices
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh System Checks</span>
        </button>
      </div>

      {/* System Observability Health Grid - Clean White Card */}
      {health && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Platform Health & System Observability</span>
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
              Status: {health.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Backend</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.backend}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Database</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.database}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">AI Engine</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.ai_engine}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Map Engine</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.map_engine}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">ML Surrogate</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.ml_service}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data Pipeline</span>
              <strong className="text-slate-900 font-mono text-xs block truncate">{health.data_pipeline}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Geospatial & Meteorological Data Sources Registry */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 text-base">
          Integrated Disaster Datasets & Open APIs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(sources || []).map((src) => (
            <div
              key={src.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm leading-snug">{src.name}</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    {src.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{src.category}</span>
                <span className="text-[11px] text-slate-500 font-mono">Sync: {src.refresh_rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
