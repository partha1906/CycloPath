import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Package, 
  MessageSquare, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Download,
  MapPin
} from 'lucide-react';
import { AgentResponsePlan } from '../types';
import { api } from '../services/api';
import { Language, translations } from '../i18n/translations';

interface AIAgentProps {
  language: Language;
}

export const AIAgentPanel: React.FC<AIAgentProps> = ({ language }) => {
  const t = translations[language];

  const [prompt, setPrompt] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('Puri');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AgentResponsePlan | null>(null);
  const [showToolTrace, setShowToolTrace] = useState(true);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Quick query chips
  const quickChips = [
    "Which hospitals are most vulnerable and need backup power?",
    "Generate emergency evacuation plan for target district",
    "Identify safer transport routes avoiding coastal surge breaches",
    "What critical infrastructure is within 25 km of cyclone landfall?"
  ];

  const districts = ['Puri', 'Jagatsinghpur', 'Kendrapara', 'Balasore', 'Bhadrak', 'Khurda'];

  const handleQuery = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await api.queryAgent({
        query: q,
        district: targetDistrict,
        language: language
      });
      setPlan(res);
    } catch (err) {
      console.error('Agent query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'brief' | 'alert') => {
    navigator.clipboard.writeText(text);
    if (type === 'brief') {
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } else {
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    }
  };

  const downloadIncidentMemo = () => {
    if (!plan) return;
    const topPriorities = plan.top_priorities || [];
    const recommendedActions = plan.recommended_actions || [];
    const resourceAllocation = plan.resource_allocation || [];

    const memo = `=====================================================
CYCLOPATH AI - EMERGENCY INCIDENT ACTION PLAN MEMORANDUM
Generated for: ${targetDistrict} District Incident Command
Query: ${plan.query}
=====================================================

1. SITUATION SUMMARY:
${plan.situation_summary}

2. TOP PRIORITY ASSETS AT RISK:
${topPriorities.map(p => `• [Rank #${p.rank}] ${p.name} (${p.asset_id}) - Vulnerability: ${p.risk_score}/100\n  Threat: ${p.primary_threat}\n  Action: ${p.recommended_first_step}`).join('\n\n')}

3. TACTICAL DIRECTIVES:
${recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

4. RESOURCE STAGING:
${resourceAllocation.map(r => `• ${r.resource}: ${r.allocation} -> ${r.location}`).join('\n')}

5. PUBLIC CITIZEN BROADCAST:
${plan.citizen_communication_draft}

Disclaimer: ${plan.disclaimer}
`;

    const blob = new Blob([memo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cyclopath_Action_Plan_${targetDistrict}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bot className="w-7 h-7 text-slate-800" />
            <span>Cyclopath Autonomous Response Agent</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered emergency disaster response synthesizer operating with verified tool-calling architecture & Gemini
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Deterministic Tool Calling + Gemini Reasoning</span>
        </div>
      </div>

      {/* Query Input Bar - Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
        {/* District Focus Picker */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Focus District:</span>
          </span>
          {districts.map(d => (
            <button
              key={d}
              onClick={() => setTargetDistrict(d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                targetDistrict === d
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 gap-3">
          <Bot className="w-5 h-5 text-slate-600 shrink-0" />
          <input
            type="text"
            placeholder={`Ask a disaster preparedness question for ${targetDistrict} District...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="bg-transparent text-slate-900 text-sm outline-none w-full placeholder-slate-400 font-medium"
          />
          <button
            onClick={() => handleQuery()}
            disabled={loading || !prompt.trim()}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Query Agent</span>
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Suggested queries:</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(chip);
                handleQuery(chip);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Agent Response */}
      {plan && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-600">
              Generated Action Plan for <span className="text-slate-900 font-bold">{targetDistrict} District</span>
            </div>
            <button
              onClick={downloadIncidentMemo}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Incident Memo (.txt)</span>
            </button>
          </div>

          {/* Tool Execution Trace Box */}
          <div className="rounded-xl bg-slate-900 text-slate-100 border border-slate-800 overflow-hidden shadow-xs">
            <div 
              onClick={() => setShowToolTrace(!showToolTrace)}
              className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2 font-mono text-emerald-400">
                <Terminal className="w-4 h-4" />
                <span>Transparent AI Tool Execution Trace ({(plan.tool_calls || []).length} tools called)</span>
              </div>
              <button className="text-slate-400 hover:text-white">
                {showToolTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showToolTrace && (
              <div className="p-5 space-y-3 text-xs font-mono divide-y divide-slate-800">
                {(plan.tool_calls || []).map((tool, i) => (
                  <div key={i} className="pt-3 first:pt-0 space-y-1">
                    <div className="text-sky-300 font-bold flex items-center gap-2">
                      <span className="text-slate-500">[{i + 1}]</span>
                      <span>call {tool.tool_name}({JSON.stringify(tool.arguments)})</span>
                    </div>
                    <div className="text-slate-300 text-[11px] pl-5 leading-relaxed">
                      ↳ {tool.result_summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1. Situation Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <span>Situation Summary & Threat Overview</span>
              </h3>
              <button
                onClick={() => copyToClipboard(plan.situation_summary, 'brief')}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBrief ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {plan.situation_summary}
            </p>
          </div>

          {/* 2. Top Priorities */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Priority Infrastructure Threats ({targetDistrict} District)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(plan.top_priorities || []).map((item) => (
                <div key={item.rank} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center shrink-0">
                        #{item.rank}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.asset_id} · <span className="capitalize">{item.type.replace('_', ' ')}</span></div>
                      </div>
                    </div>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 tabular-nums">
                      {item.risk_score}/100
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-200">
                    <span className="font-medium text-slate-800">Primary Hazard: </span>
                    {item.primary_threat}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">Recommended Directive: </span>
                    {item.recommended_first_step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recommended Operational Directives */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Tactical Directives</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {(plan.recommended_actions || []).map((act, i) => (
                <li key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 shrink-0">{i + 1}.</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Resource Allocation & Citizen Notice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resources */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-700" />
                <span>Pre-Positioned Resource Allocation</span>
              </h3>
              <div className="space-y-2">
                {(plan.resource_allocation || []).map((res, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900">{res.resource}</div>
                      <div className="text-slate-500 text-[11px]">{res.location}</div>
                    </div>
                    <span className="font-medium text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
                      {res.allocation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multilingual Citizen Advisory */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                  <span>Citizen Public Broadcast Draft ({plan.language.toUpperCase()})</span>
                </h3>
                <button
                  onClick={() => copyToClipboard(plan.citizen_communication_draft, 'alert')}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedAlert ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAlert ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
                {plan.citizen_communication_draft}
              </div>
              <div className="text-[11px] text-slate-500">
                Official text synthesized for SMS, WhatsApp Disaster Channels, and Community Radio.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
