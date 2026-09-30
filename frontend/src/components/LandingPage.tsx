import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  Cpu, 
  Activity, 
  ArrowRight, 
  Layers, 
  Building2, 
  Users, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle,
  PlayCircle,
  Sparkles,
  Server,
  Cloud
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { RiskSummary, Cyclone } from '../types';

interface LandingPageProps {
  summary: RiskSummary | null;
  cyclone: Cyclone | null;
  onLaunchCommand: () => void;
  onLaunchDemoStory: () => void;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  summary,
  cyclone,
  onLaunchCommand,
  onLaunchDemoStory,
  onNavigateTab,
  language
}) => {
  const t = translations[language];

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1e293b] bg-gradient-to-b from-[#0c1222] via-[#090d18] to-[#06080f] p-8 sm:p-14 text-center space-y-6 shadow-2xl">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Demo Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Google Build with AI Hackathon • Track 5: Cyclone Impact & Infrastructure Vulnerability</span>
        </div>

        {/* Big Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            CYCLOPATH <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">AI</span>
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.tagline}
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Turn cyclone forecasts and geospatial datasets into prioritized, actionable infrastructure-risk intelligence for Indian coastal communities.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <button
            onClick={onLaunchCommand}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>{t.btn_launch_command}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchDemoStory}
            className="px-6 py-3.5 rounded-xl bg-[#121929] hover:bg-[#1a243a] text-slate-200 border border-slate-700/80 font-bold text-sm flex items-center gap-2 transition"
          >
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>Launch 3-Minute Demo Story</span>
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center">
            <span className="text-amber-400 font-semibold uppercase">Decision-Support Prototype: </span>
            AI-generated vulnerability estimates are modeled outputs. Always validate against official India Meteorological Department (IMD) warnings and State Disaster Management Authority (SDMA) evacuation orders.
          </div>
        </div>
      </div>

      {/* Live Impact Counter Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Infrastructure Monitored</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summary?.total_monitored || 87}
          </div>
          <div className="text-[11px] text-slate-500">
            Hospitals, Grid Substations, Bridges, Roads
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2 border-red-900/40 bg-red-950/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">High & Critical Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400">
            {summary ? summary.critical_assets + summary.high_risk_assets : 16}
          </div>
          <div className="text-[11px] text-red-300/70">
            Immediate defense & staging required
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Districts Analyzed</span>
            <Map className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summary?.district_breakdown.length || 24}
          </div>
          <div className="text-[11px] text-slate-500">
            Odisha, West Bengal, AP, TN, Maharashtra
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Exposed Population</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            ~485,000
          </div>
          <div className="text-[11px] text-slate-500">
            Modeled coastal population in hazard cone
          </div>
        </div>
      </div>

      {/* 4 User Personas */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Designed for Operational Emergency Personas</h2>
          <p className="text-sm text-slate-400">Empowering every level of India's disaster management framework</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 space-y-3 hover:border-cyan-500/50 transition">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-white text-base">Disaster Management Authority</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              District-wide risk ranking, multi-hazard exposure maps, resource pre-positioning directives, and automated situation reports.
            </p>
          </div>

          <div className="glass-panel p-5 space-y-3 hover:border-blue-500/50 transition">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-white text-base">Municipal Government Officer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Granular health facility status, electrical substation de-energization plans, bridge scour warnings, and drainage dewatering.
            </p>
          </div>

          <div className="glass-panel p-5 space-y-3 hover:border-indigo-500/50 transition">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-white text-base">Emergency First Responder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safest evacuation corridors (Dijkstra algorithm) avoiding breach zones, shelter occupancy tracking, and staging hubs.
            </p>
          </div>

          <div className="glass-panel p-5 space-y-3 hover:border-emerald-500/50 transition">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-white text-base">Public Citizen / Community</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Local shelter locators, multi-lingual alerts (English, हिंदी, मराठी), safe inland routes, and emergency helpline guides.
            </p>
          </div>
        </div>
      </div>

      {/* Google Cloud Architecture Blueprint */}
      <div className="glass-panel p-6 sm:p-8 space-y-6 border-slate-700/80">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-sky-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Google Cloud & AI Platform Architecture</h3>
            <p className="text-xs text-slate-400">Enterprise cloud-native pipeline built for resilience during extreme weather emergencies</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">Cloud Run</span>
            <p className="text-slate-400 text-[11px]">Serverless, auto-scaling FastAPI backend container</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 block">Vertex AI / Gemini</span>
            <p className="text-slate-400 text-[11px]">Multimodal vision inspection & reasoning agent</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 block">Cloud SQL</span>
            <p className="text-slate-400 text-[11px]">PostgreSQL with PostGIS for geospatial indexing</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-blue-400 block">BigQuery</span>
            <p className="text-slate-400 text-[11px]">Historical cyclone analytics & hazard modeling</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 block">Cloud Pub/Sub</span>
            <p className="text-slate-400 text-[11px]">Real-time telemetry ingestion from weather radars</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 block">Cloud Storage</span>
            <p className="text-slate-400 text-[11px]">Satellite imagery, DEM grids, and generated PDF reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};
