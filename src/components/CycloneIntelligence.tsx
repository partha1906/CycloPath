import React, { useState } from 'react';
import { 
  Wind, 
  Gauge, 
  Clock, 
  CloudRain, 
  Waves, 
  ShieldAlert,
  Compass
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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                IMD Classification · {cyclone?.category || 'Extremely Severe Cyclonic Storm'}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                {cyclone?.cyclone_code || 'BOB-2026-03'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {cyclone?.name || 'Cyclone SAMUDRA'}
            </h1>
            <p className="text-xs text-slate-500">
              High-resolution numerical weather prediction assimilation from IMD Radar and INCOIS Ocean Buoys
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-right shrink-0">
            <span className="text-slate-500 block mb-0.5">Landfall Window Projection:</span>
            <strong className="text-slate-900 font-mono text-sm block">{cyclone?.estimated_landfall_time || 'T-6.5 Hours'}</strong>
            <span className="text-slate-600 text-[11px]">{cyclone?.estimated_landfall_location || 'Between Puri and Paradip, Odisha'}</span>
          </div>
        </div>
      </div>

      {/* Trajectory Timeline Scrubber */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Multi-Stage Cyclone Timeline (T-36h to T+24h)</span>
            </h2>
            <p className="text-xs text-slate-500">Select timestamp to inspect localized meteorological and coastal risk profile</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click step to examine</span>
        </div>

        {/* Timeline Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {(points || []).map((pt, idx) => {
            const isSelected = idx === selectedPointIndex;
            const isLandfall = pt.time.includes('Landfall');
            const isCurrent = pt.time.includes('Current');

            return (
              <button
                key={idx}
                onClick={() => setSelectedPointIndex(idx)}
                className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : isLandfall
                    ? 'bg-amber-50 border-amber-300 text-slate-900 hover:bg-amber-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold truncate">
                    {pt.time}
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {pt.lat}°N, {pt.lng}°E
                  </div>
                </div>

                <div className={`mt-3 text-xs font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {pt.wind_kmh} <span className={`text-[10px] font-normal ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>km/h</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Meteorological Profile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-700" />
            <span>Atmospheric Telemetry ({activePt.time})</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Core Wind Speed:</span>
              <strong className="text-slate-900 text-sm font-mono tabular-nums">{activePt.wind_kmh} km/h</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Central Pressure:</span>
              <strong className="text-slate-900 text-sm font-mono tabular-nums">{activePt.pressure_hpa} hPa</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Intensity Stage:</span>
              <strong className="text-rose-700 font-semibold">{activePt.intensity}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Eye Coordinates:</span>
              <span className="font-mono text-slate-900 font-semibold">{activePt.lat}°N, {activePt.lng}°E</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Waves className="w-4 h-4 text-slate-700" />
            <span>Storm Surge & Inundation Model</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Peak Astronomical Tide Rise:</span>
                <strong className="text-rose-700 font-mono text-sm tabular-nums">+{cyclone?.storm_surge_potential_m || 4.5} m</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Calculated for low-lying coastal estuaries in Kendrapara & Jagatsinghpur.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Inland Penetration Limit:</span>
                <strong className="text-slate-900 font-mono text-sm tabular-nums">~6.8 km</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Mangrove buffers in Bhitarkanika reduce tidal wave velocity by ~35%.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-slate-700" />
            <span>Precipitation & Flash Flood Index</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Cumulative 24h Rainfall:</span>
                <strong className="text-slate-900 font-mono text-sm tabular-nums">{cyclone?.rainfall_24h_mm || 340} mm</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Extreme precipitation expected across coastal river catchments (Mahanadi delta).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Flash Flood Vulnerability:</span>
                <strong className="text-rose-700 font-bold uppercase">High Concern</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Ground saturation exceeds 85%, accelerating surface water runoff to urban storm drains.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
