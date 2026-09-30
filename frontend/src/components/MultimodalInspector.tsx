import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { MultimodalAnalysis } from '../types';
import { api } from '../services/api';

export const MultimodalInspector: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'substation' | 'hospital' | 'bridge'>('substation');
  const [contextNotes, setContextNotes] = useState('Coastal facility facing severe cyclone surge inundation');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MultimodalAnalysis | null>(null);

  const presets = {
    substation: {
      id: 'PWR-OD-002',
      title: 'Paradip Port 220kV Grid Substation Switchyard',
      desc: 'Saline surge water encroachments near 33kV outdoor transformer plinths.',
      imageSvg: 'substation'
    },
    hospital: {
      id: 'HOSP-OD-001',
      title: 'Puri District Hospital Emergency Ramp & Basement',
      desc: 'Ground-level ambulance bay inundated with brackish storm runoff.',
      imageSvg: 'hospital'
    },
    bridge: {
      id: 'BRG-OD-002',
      title: 'Devi River Coastal Bridge Pier Scour Inspection',
      desc: 'Hydrodynamic discharge carrying heavy uprooted drift debris against Pier 3.',
      imageSvg: 'bridge'
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const p = presets[selectedPreset];
      const res = await api.analyzeMultimodalImage({
        asset_id: p.id,
        context_notes: contextNotes
      });
      setAnalysis(res);
    } catch (err) {
      console.error('Multimodal analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Camera className="w-6 h-6 text-cyan-400" />
          <span>Multimodal AI Infrastructure Vision Screening</span>
        </h2>
        <p className="text-xs text-slate-400">
          Powered by Google Gemini 1.5 Multimodal Vision for rapid damage indicators, visible water depth, and structural triage
        </p>
      </div>

      {/* Preset Selection & Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(presets) as Array<keyof typeof presets>).map((key) => {
          const item = presets[key];
          const isSelected = selectedPreset === key;

          return (
            <div
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`glass-panel p-4 cursor-pointer transition relative space-y-2 border ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-slate-900 to-[#0e1629] border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                {/* SVG Visual Representation */}
                <div className="text-center space-y-1 z-10">
                  <Camera className="w-8 h-8 text-cyan-400 mx-auto opacity-80" />
                  <span className="text-[11px] font-mono text-cyan-300 font-bold block">{item.id}</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/5"></div>
              </div>

              <div className="font-bold text-white text-xs">{item.title}</div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Action Trigger */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3">
          <input
            type="text"
            placeholder="Add contextual observations (e.g. water rising, wind gusts 150 km/h)..."
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            className="w-full bg-[#090d18] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-300" />
          )}
          <span>Run Gemini Multimodal Inspection</span>
        </button>
      </div>

      {/* Multimodal Analysis Output */}
      {analysis && (
        <div className="glass-panel p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>GEMINI 1.5 MULTIMODAL VISION EVALUATION</span>
                </span>
                <span className="badge-critical px-2 py-0.5 rounded text-[10px] font-bold">
                  {analysis.structural_integrity_concern.toUpperCase()} CONCERN
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Visual Inspection for {analysis.asset_id}
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">INSPECTION PRIORITY</span>
              <strong className="text-red-400 font-mono text-sm">{analysis.inspection_priority}</strong>
            </div>
          </div>

          {/* Observations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-300 block">Visible Flooding Extent:</span>
              <p className="text-slate-300 leading-relaxed">{analysis.visible_flooding}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-300 block">Road & Perimeter Accessibility:</span>
              <p className="text-slate-300 leading-relaxed">{analysis.road_accessibility_status}</p>
            </div>
          </div>

          {/* Damage Indicators */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Specific Identified Damage Indicators:</span>
            <div className="space-y-1.5 text-xs text-slate-300">
              {analysis.damage_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-red-950/20 border border-red-800/40 text-red-200 flex items-start gap-2">
                  <span className="font-bold text-red-400 font-mono">{i + 1}.</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engineering Reasoning */}
          <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-cyan-300 block">Structural Engineering AI Reasoning:</span>
            <p className="text-slate-300 leading-relaxed italic">
              "{analysis.reasoning}"
            </p>
          </div>

          {/* Mandatory Engineering Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
            {analysis.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
