import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Building2, 
  MapPin, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getLatestReport();
        setReport(data);
      } catch (err) {
        console.error('Report fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Emergency Infrastructure Vulnerability Assessment Report</span>
          </h2>
          <p className="text-xs text-slate-400">
            Formally structured situational intelligence report prepared for Incident Commanders & DEOC
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel p-6 sm:p-10 space-y-8 bg-[#0a0e1a] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
        {/* Document Header */}
        <div className="border-b border-slate-700 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              CYCLOPATH AI DISASTER INTELLIGENCE PLATFORM • SITUATION BRIEF
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {report.report_title}
            </h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Generated: <strong className="text-slate-300 font-mono">{report.generated_at}</strong></span>
              <span>•</span>
              <span>Scenario: <strong className="text-cyan-300">{report.scenario}</strong></span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 text-xs text-right">
            <span className="text-slate-400 block text-[10px]">CLASSIFICATION</span>
            <strong className="text-red-400 font-bold uppercase">OFFICIAL USE / DECISION SUPPORT</strong>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-cyan-400">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#070b14] p-4 rounded-xl border border-slate-800/80">
            {report.executive_summary}
          </p>
        </div>

        {/* 2. Key Situation Metrics Grid */}
        <div className="space-y-2">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-cyan-400">
            2. Core Vulnerability Metrics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOTAL ASSETS MONITORED</span>
              <strong className="text-white text-xl font-mono">{report.metrics.total_monitored_assets}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070b14] border border-red-900/40">
              <span className="text-red-400 block text-[10px]">CRITICAL / HIGH RISK</span>
              <strong className="text-red-400 text-xl font-mono">{report.metrics.critical_assets + report.metrics.high_risk_assets}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HOSPITALS AT RISK</span>
              <strong className="text-amber-400 text-xl font-mono">{report.metrics.hospitals_at_risk}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EST. POPULATION EXPOSED</span>
              <strong className="text-cyan-400 text-xl font-mono">~{report.metrics.estimated_exposed_population.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* 3. Priority Assets Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-cyan-400">
            3. Prioritized Critical Infrastructure Roster
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070b14] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ASSET</th>
                  <th className="py-2.5 px-3 font-semibold">DISTRICT</th>
                  <th className="py-2.5 px-3 font-semibold">SCORE</th>
                  <th className="py-2.5 px-3 font-semibold">PRIMARY HAZARD DRIVER</th>
                  <th className="py-2.5 px-3 font-semibold">FIRST DIRECTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.critical_assets.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {item.name}
                      <span className="block font-mono text-[10px] text-slate-500 font-normal">{item.asset_id} • {item.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{item.district}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-red-400">{item.score}/100</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.primary_driver}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.urgent_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Shelter & Evacuation Staging */}
        <div className="space-y-2">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-cyan-400">
            4. Evacuation & Shelter Logistics
          </h3>
          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 text-xs space-y-2 text-slate-300">
            <div>Total active multi-purpose cyclone shelters: <strong>{report.evacuation_and_shelter.monitored_shelters}</strong></div>
            <div>Cumulative safe intake capacity: <strong>{report.evacuation_and_shelter.shelter_capacity_total.toLocaleString()} citizens</strong></div>
            <div>Target evacuation threshold: <strong>~{report.evacuation_and_shelter.estimated_target_evacuees.toLocaleString()} vulnerable residents</strong></div>
            <div>Priority evacuation belts: <strong className="text-amber-300">{report.evacuation_and_shelter.priority_zones.join(', ')}</strong></div>
          </div>
        </div>

        {/* 5. Official Disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed italic">
            {report.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
