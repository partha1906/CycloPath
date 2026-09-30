import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { MultimodalAnalysis } from '../types';
import { api } from '../services/api';

export const MultimodalInspector: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'substation' | 'hospital' | 'bridge' | 'custom'>('substation');
  const [contextNotes, setContextNotes] = useState('Coastal facility facing severe cyclone surge inundation');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MultimodalAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = {
    substation: {
      id: 'PWR-OD-002',
      title: 'Paradip Port 220kV Grid Substation Switchyard',
      desc: 'Saline surge water encroachments near 33kV outdoor transformer plinths.',
    },
    hospital: {
      id: 'HOSP-OD-001',
      title: 'Puri District Hospital Emergency Ramp & Basement',
      desc: 'Ground-level ambulance bay inundated with brackish storm runoff.',
    },
    bridge: {
      id: 'BRG-OD-002',
      title: 'Devi River Coastal Bridge Pier Scour Inspection',
      desc: 'Hydrodynamic discharge carrying heavy uprooted drift debris against Pier 3.',
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageBase64(result);
      setSelectedPreset('custom');
      setContextNotes(`Field inspection photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const isCustom = selectedPreset === 'custom';
      const p = isCustom ? null : presets[selectedPreset];
      const assetId = isCustom ? 'CUSTOM-INSPECTION-01' : p!.id;
      
      const res = await api.analyzeMultimodalImage({
        image_base64: customImageBase64 || undefined,
        asset_id: assetId,
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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Camera className="w-7 h-7 text-slate-800" />
            <span>Multimodal AI Infrastructure Vision Screening</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Powered by Google Gemini Multimodal Vision for rapid damage indicators, visible water depth, and structural triage
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4 text-slate-600" />
          <span>Upload Field Photo</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {/* Preset Selection & Inspection Targets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.keys(presets) as Array<keyof typeof presets>).map((key) => {
          const item = presets[key];
          const isSelected = selectedPreset === key;

          return (
            <div
              key={key}
              onClick={() => {
                setSelectedPreset(key);
                setCustomImageBase64(null);
              }}
              className={`bg-white p-5 rounded-xl cursor-pointer transition relative space-y-3 border ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="h-28 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                <Camera className="w-7 h-7 text-slate-500 mx-auto" />
                <span className="text-xs font-mono text-slate-800 font-bold block mt-1">{item.id}</span>
              </div>

              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{item.title}</div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
              </div>
            </div>
          );
        })}

        {/* Custom Upload Card */}
        <div
          onClick={() => {
            if (!customImageBase64) {
              fileInputRef.current?.click();
            } else {
              setSelectedPreset('custom');
            }
          }}
          className={`bg-white p-5 rounded-xl cursor-pointer transition relative space-y-3 border ${
            selectedPreset === 'custom'
              ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="h-28 rounded-lg bg-slate-100 border border-slate-200 border-dashed flex flex-col items-center justify-center p-3 relative overflow-hidden">
            {customImageBase64 ? (
              <img 
                src={customImageBase64} 
                alt="Uploaded field photo" 
                className="w-full h-full object-cover rounded" 
              />
            ) : (
              <div className="text-center text-slate-500">
                <Upload className="w-7 h-7 mx-auto mb-1 text-slate-400" />
                <span className="text-xs font-semibold block">Click to Upload</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                {customImageBase64 ? 'Custom Field Photo' : 'Upload Your Photo'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {customImageBase64 ? 'Image ready for Gemini vision triage' : 'Select JPEG, PNG from mobile or disk'}
              </p>
            </div>
            {customImageBase64 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomImageBase64(null);
                  setSelectedPreset('substation');
                }}
                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Trigger Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Contextual Field Observations</label>
          <input
            type="text"
            placeholder="Add contextual observations (e.g. seawater overtopping plinth, roof shingles displaced, power outage)..."
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition self-end sm:self-auto cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Run Gemini Multimodal Inspection</span>
        </button>
      </div>

      {/* Multimodal Analysis Output - Clean White Card */}
      {analysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>GEMINI MULTIMODAL VISION EVALUATION</span>
                </span>
                <span className="badge-critical px-2.5 py-0.5 rounded text-xs font-bold">
                  {analysis.structural_integrity_concern.toUpperCase()} CONCERN
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Visual Inspection Report for {analysis.asset_id}
              </h2>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Inspection Priority</span>
              <strong className="text-rose-700 font-mono text-sm">{analysis.inspection_priority}</strong>
            </div>
          </div>

          {/* Observations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block">Visible Flooding Extent:</span>
              <p className="text-slate-700 leading-relaxed">{analysis.visible_flooding}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block">Road & Perimeter Accessibility:</span>
              <p className="text-slate-700 leading-relaxed">{analysis.road_accessibility_status}</p>
            </div>
          </div>

          {/* Damage Indicators */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-900 block">Specific Identified Damage Indicators:</span>
            <div className="space-y-2 text-xs text-slate-800">
              {(analysis.damage_indicators || []).map((ind, i) => (
                <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                  <span className="font-bold text-rose-700 font-mono">{i + 1}.</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning & Confidence */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-bold text-slate-900">Multimodal Engineering Rationale:</span>
              <span className="font-mono text-slate-600">Model Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{analysis.reasoning}</p>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-500 italic">
            * {analysis.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
