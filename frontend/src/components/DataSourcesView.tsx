import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Server,
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
        api.getDataSources(),
        api.getSystemHealth()
      ]);
      setSources(srcs);
      setHealth(h);
    } catch (err) {
      console.error('Data sources error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>Data Sources & Observability Health</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time status of meteorological feeds, satellite DEM rasters, geospatial topologies, and backend microservices
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Health Checks</span>
        </button>
      </div>

      {/* System Observability Health Grid */}
      {health && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Platform Health & System Observability</span>
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              STATUS: {health.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">BACKEND</span>
              <strong className="text-emerald-400 font-mono text-[11px] block truncate">{health.backend}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">DATABASE</span>
              <strong className="text-emerald-400 font-mono text-[11px] block truncate">{health.database}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">AI ENGINE</span>
              <strong className="text-cyan-400 font-mono text-[11px] block truncate">{health.ai_engine}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">MAP ENGINE</span>
              <strong className="text-emerald-400 font-mono text-[11px] block truncate">{health.map_engine}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">ML SURROGATE</span>
              <strong className="text-indigo-400 font-mono text-[11px] block truncate">{health.ml_service}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[10px]">DATA PIPELINES</span>
              <strong className="text-emerald-400 font-mono text-[11px] block truncate">{health.data_pipeline}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Official Data Sources Registry */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm">Official & Public Data Integrations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div key={src.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{src.name}</h4>
                  <div className="text-[11px] text-cyan-400 font-medium">{src.provider}</div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  {src.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {src.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                <span>Update: {src.update_frequency}</span>
                {src.url && (
                  <a 
                    href={src.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-sans"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
