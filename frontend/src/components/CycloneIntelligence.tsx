import React, { useState } from 'react';
import { 
  Wind, 
  Gauge, 
  Compass, 
  Clock, 
  MapPin, 
  Calendar, 
  CloudRain, 
  Waves, 
  TrendingDown, 
  Play, 
  Pause,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Cyclone } from '../types';
import { Language, translations } from '../i18n/translations';

interface CycloneIntelProps {
  cyclone: Cyclone | null;
  language: Language;
}

export const CycloneIntelligence: React.FC<CycloneIntelProps> = ({
  cyclone,
  language
}) => {
  const t = translations[language];

  const points = cyclone?.trajectory_points || [];
  const [selectedPointIndex, setSelectedPointIndex] = useState(2); // Default to current T-12h
  const activePt = points[selectedPointIndex] || points[0] || {
    time: 'T-12h (Current)',
    lat: 19.3,
    lng: 86.2,
    wind_kmh: 165.0,
    intensity: 'Extremely Severe Cyclonic Storm',
    pressure_hpa: 952.0
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                IMD CLASSIFICATION • {cyclone?.category}
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">
                {cyclone?.cyclone_code}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {cyclone?.name || 'Cyclone SAMUDRA'}
            </h2>
          </div>

          <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 text-xs text-right">
            <span className="text-slate-400 block">Landfall Window Projection:</span>
            <strong className="text-cyan-300 font-mono text-sm">{cyclone?.estimated_landfall_time}</strong>
          </div>
        </div>
      </div>

      {/* Trajectory Timeline Scrubber */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Multi-Stage Cyclone Timeline (T-36h to T+24h)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Select timestamp to inspect atmospheric profile</span>
        </div>

        {/* Timeline Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {points.map((pt, idx) => {
            const isSelected = idx === selectedPointIndex;
            const isLandfall = pt.time.includes('Landfall');
            const isCurrent = pt.time.includes('Current');

            return (
              <button
                key={idx}
                onClick={() => setSelectedPointIndex(idx)}
                className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg'
                    : isLandfall
                    ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                    : 'bg-[#090d18] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="text-[11px] font-bold truncate">
                    {pt.time}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {pt.lat}N, {pt.lng}E
                  </div>
                </div>

                <div className="mt-2 text-xs font-bold text-cyan-300 font-mono">
                  {pt.wind_kmh} <span className="text-[10px] text-slate-400">km/h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Meteorological Profile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Atmospheric Telemetry ({activePt.time})</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Core Wind Speed:</span>
              <strong className="text-white text-sm font-mono">{activePt.wind_kmh} km/h</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Central Pressure:</span>
              <strong className="text-white text-sm font-mono">{activePt.pressure_hpa} hPa</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Intensity Stage:</span>
              <strong className="text-amber-400">{activePt.intensity}</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Eye Coordinates:</span>
              <span className="font-mono text-cyan-400">{activePt.lat}°N, {activePt.lng}°E</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Waves className="w-4 h-4 text-indigo-400" />
            <span>Storm Surge & Inundation Model</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Peak Astronomical Tide Rise:</span>
                <strong className="text-indigo-400 font-mono text-sm">+4.5 m</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Calculated for low-lying coastal estuaries in Kendrapara & Jagatsinghpur.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Inland Penetration Limit:</span>
                <strong className="text-white font-mono text-sm">~6.8 km</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Mangrove buffers in Bhitarkanika reduce tidal wave velocity by ~35%.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span>Precipitation & Flash Flood Index</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total 24h Precipitation:</span>
                <strong className="text-sky-400 font-mono text-sm">340 mm</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Extremely heavy rainfall warning active across 6 coastal districts.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">River Catchment Flood Alert:</span>
                <strong className="text-red-400 font-mono text-sm">Mahanadi & Baitarani</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Water release from Hirakud dam to be regulated to prevent downstream tidal lockup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
