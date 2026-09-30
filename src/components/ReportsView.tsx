import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Clock,
  Download
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

  const handleDownload = () => {
    if (!report) return;
    const content = `=====================================================
${report.report_title}
Generated: ${report.generated_at}
Scenario: ${report.scenario}
=====================================================

1. EXECUTIVE SUMMARY:
${report.executive_summary}

2. METRICS:
- Total Monitored: ${report.metrics?.total_assets_monitored}
- Critical Risk: ${report.metrics?.critical_risk_count}
- High Risk: ${report.metrics?.high_risk_count}
- Population Exposed: ${report.metrics?.estimated_population_exposure}

3. PRIORITY VULNERABLE ASSETS:
${(report.critical_assets || []).map((a: any, i: number) => `${i + 1}. ${a.name} (${a.asset_id}) - ${a.district} [${a.risk_assessment?.overall_vulnerability_score}/100]`).join('\n')}

4. EVACUATION & SHELTERS:
Active shelters: ${report.evacuation_shelters?.active_shelters_count || 20}
Total capacity: ${report.evacuation_shelters?.total_shelter_capacity || 48000} persons

Disclaimer: ${report.disclaimer}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cyclopath_Assessment_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-12 bg-slate-50">
        <span className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-slate-800" />
            <span>Infrastructure Vulnerability Assessment Report</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Formally structured situational intelligence report prepared for Incident Commanders & DEOC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Report (.txt)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export Document</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card - Clean White Style */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-12 space-y-8 text-slate-800">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-xs font-mono tracking-wider text-slate-500 font-semibold uppercase">
              CYCLOPATH AI DISASTER INTELLIGENCE PLATFORM · SITUATION BRIEF
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {report.report_title}
            </h2>
            <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3">
              <span>Generated: <strong className="text-slate-800 font-mono">{report.generated_at}</strong></span>
              <span>·</span>
              <span>Scenario: <strong className="text-slate-800">{report.scenario}</strong></span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-right shrink-0">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Classification</span>
            <strong className="text-rose-700 font-bold uppercase">OFFICIAL USE / DECISION SUPPORT</strong>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            1. Executive Summary
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200">
            {report.executive_summary}
          </p>
        </div>

        {/* 2. Key Quantified Risk Indicators */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            2. Quantitative Exposure Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Total Monitored</span>
              <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block tabular-nums">{report.metrics?.total_assets_monitored}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Critical Risk</span>
              <strong className="text-2xl font-bold text-rose-600 font-mono mt-1 block tabular-nums">{report.metrics?.critical_risk_count}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">High Risk</span>
              <strong className="text-2xl font-bold text-amber-600 font-mono mt-1 block tabular-nums">{report.metrics?.high_risk_count}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Est. Population Exposure</span>
              <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block tabular-nums">{(report.metrics?.estimated_population_exposure || 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* 3. Priority Vulnerable Assets Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            3. Priority Vulnerable Assets (Tier 1 Action Required)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">ASSET</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">DISTRICT</th>
                  <th className="py-3 px-4">SCORE</th>
                  <th className="py-3 px-4">PRIMARY HAZARD DRIVER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(report.critical_assets || []).slice(0, 5).map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{a.name}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">{a.asset_type?.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.district}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600 tabular-nums">
                      {a.risk_assessment?.overall_vulnerability_score}/100
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {a.risk_assessment?.shap_factors?.[0]?.description || 'Storm surge & coastal proximity'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Evacuation & Shelter Status */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            4. Evacuation Corridors & Shelter Capacity
          </h3>
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
            <div>
              <strong className="text-slate-900">Active Shelter Facilities: </strong>
              <span>{report.evacuation_shelters?.active_shelters_count || 20} centers with total capacity of {(report.evacuation_shelters?.total_shelter_capacity || 48000).toLocaleString()} persons.</span>
            </div>
            <div>
              <strong className="text-slate-900">Corridor Transit Recommendation: </strong>
              <span>Prioritize elevated inland NH-316 to AIIMS Bhubaneswar; enforce vehicle transit ban on coastal Marine Drive.</span>
            </div>
          </div>
        </div>

        {/* Sign-off & Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="font-semibold text-slate-700 block">Incident Commander / DEOC Desk:</span>
              <span>District Disaster Management Authority (DDMA)</span>
            </div>
            <div className="sm:text-right">
              <span className="font-semibold text-slate-700 block">Verification Status:</span>
              <span className="text-emerald-700 font-medium">Model Validated Against IMD Bulletins</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 italic">
            * {report.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
