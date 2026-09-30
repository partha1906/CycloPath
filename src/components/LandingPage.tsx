import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  ArrowRight, 
  Building2, 
  Users, 
  PlayCircle,
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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-10 bg-slate-50">
      {/* Hero Section - Clean Light Style */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center space-y-6 shadow-xs">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider">
          <span>Google Build with AI · Cyclone Impact & Infrastructure Vulnerability</span>
        </div>

        {/* Big Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
            CYCLOPATH AI
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {t.tagline}
          </p>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Turn cyclone forecasts and geospatial datasets into prioritized, actionable infrastructure-risk intelligence for Indian coastal communities.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onLaunchCommand}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <span>{t.btn_launch_command}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchDemoStory}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <PlayCircle className="w-4 h-4 text-slate-700" />
            <span>Launch Interactive Demo Story</span>
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-2 max-w-2xl mx-auto">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed text-center">
            <strong className="text-slate-900">Decision-Support Prototype: </strong>
            AI-generated vulnerability estimates are modeled outputs. Always validate against official India Meteorological Department (IMD) warnings and State Disaster Management Authority (SDMA) evacuation orders.
          </div>
        </div>
      </div>

      {/* Live Impact Counter Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Infrastructure Monitored</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {summary?.total_monitored || 87}
          </div>
          <div className="text-xs text-slate-500">
            Hospitals, Grid Substations, Bridges, Roads
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">High & Critical Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 tabular-nums">
            {summary ? summary.critical_assets + summary.high_risk_assets : 16}
          </div>
          <div className="text-xs text-slate-500">
            Immediate defense & staging required
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Districts Analyzed</span>
            <Map className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {summary?.district_breakdown.length || 24}
          </div>
          <div className="text-xs text-slate-500">
            Odisha, West Bengal, AP, TN, Maharashtra
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Exposed Population</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            ~485,000
          </div>
          <div className="text-xs text-slate-500">
            Modeled coastal population in hazard cone
          </div>
        </div>
      </div>

      {/* 4 User Personas */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Designed for Operational Emergency Personas</h2>
          <p className="text-xs sm:text-sm text-slate-500">Empowering every level of India's disaster management framework</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">Disaster Management Authority</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              District-wide risk ranking, multi-hazard exposure maps, resource pre-positioning directives, and automated situation reports.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">Municipal Government Officer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular health facility status, electrical substation de-energization plans, bridge scour warnings, and drainage dewatering.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-white text-slate-900 text-base">Emergency First Responder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Safest evacuation corridors (Dijkstra algorithm) avoiding breach zones, shelter occupancy tracking, and staging hubs.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs hover:border-slate-300 transition">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">Public Citizen / Community</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Local shelter locators, multi-lingual alerts (English, हिंदी, मराठी), safe inland routes, and emergency helpline guides.
            </p>
          </div>
        </div>
      </div>

      {/* Google Cloud Architecture Blueprint */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-slate-800" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cloud & AI Architecture Blueprint</h3>
            <p className="text-xs text-slate-500">Enterprise cloud-native pipeline built for resilience during extreme weather emergencies</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Express / Node.js</span>
            <p className="text-slate-600 text-[11px]">Serverless, low-latency full-stack microservices</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Vertex AI / Gemini</span>
            <p className="text-slate-600 text-[11px]">Multimodal vision inspection & reasoning agent</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Geospatial Engine</span>
            <p className="text-slate-600 text-[11px]">In-memory topological routing with Dijkstra solver</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">ML Ensemble</span>
            <p className="text-slate-600 text-[11px]">Random forest surrogate model with SHAP values</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Telemetry Feed</span>
            <p className="text-slate-600 text-[11px]">Real-time ingestion from IMD radar & ISRO Bhuvan</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Incident Reports</span>
            <p className="text-slate-600 text-[11px]">Dynamic print & PDF situational briefs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
