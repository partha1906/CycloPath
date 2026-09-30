import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Package, 
  MessageSquare, 
  Globe2,
  ChevronDown,
  ChevronUp,
  Cpu
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
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AgentResponsePlan | null>(null);
  const [showToolTrace, setShowToolTrace] = useState(true);

  // Quick query chips
  const quickChips = [
    "Which hospitals are most vulnerable and need backup power?",
    "Generate emergency evacuation plan for Puri District",
    "Identify safer transport routes avoiding coastal surge breaches",
    "What critical infrastructure is within 25 km of cyclone landfall?"
  ];

  const handleQuery = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await api.queryAgent({
        query: q,
        language: language
      });
      setPlan(res);
    } catch (err) {
      console.error('Agent query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>Cyclopath Response Agent</span>
          </h2>
          <p className="text-xs text-slate-400">
            AI-powered emergency disaster response synthesizer operating with verified tool-calling architecture
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Deterministic Tool Calling + Gemini Reasoning</span>
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center bg-[#090d18] border border-slate-700/80 rounded-xl px-4 py-3 gap-3 shadow-lg">
          <Bot className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Ask a disaster preparedness question or request an action plan..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            className="bg-transparent text-white text-sm outline-none w-full placeholder-slate-500"
          />
          <button
            onClick={() => handleQuery()}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            {loading ? <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span> : <Send className="w-3.5 h-3.5" />}
            <span>Query</span>
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Suggested Prompts:</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(chip);
                handleQuery(chip);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#090d18] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 text-[11px] transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Agent Response */}
      {plan && (
        <div className="space-y-6 animate-fade-in">
          {/* Tool Execution Trace Box */}
          <div className="rounded-xl bg-[#090d18] border border-slate-800 overflow-hidden">
            <div 
              onClick={() => setShowToolTrace(!showToolTrace)}
              className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2 font-mono text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span>Transparent AI Tool Execution Trace ({plan.tool_calls.length} tools called)</span>
              </div>
              <button className="text-slate-400 hover:text-white">
                {showToolTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showToolTrace && (
              <div className="p-4 space-y-2 text-xs font-mono divide-y divide-slate-800/60">
                {plan.tool_calls.map((tool, i) => (
                  <div key={i} className="pt-2 first:pt-0 space-y-1">
                    <div className="text-cyan-300 font-bold flex items-center gap-2">
                      <span className="text-slate-500">[{i + 1}]</span>
                      <span>call {tool.tool_name}({JSON.stringify(tool.arguments)})</span>
                    </div>
                    <div className="text-slate-400 text-[11px] pl-5">
                      ↳ {tool.result_summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1. Situation Summary */}
          <div className="glass-panel p-5 space-y-2">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Situation Summary & Threat Overview</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#090d18] p-4 rounded-xl border border-slate-800">
              {plan.situation_summary}
            </p>
          </div>

          {/* 2. Top Priorities */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Top Infrastructure Priorities</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.top_priorities.map((item) => (
                <div key={item.rank} className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center justify-center">
                        #{item.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{item.type} • {item.asset_id}</div>
                      </div>
                    </div>
                    <span className="badge-critical px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.risk_score}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Threat:</span> {item.primary_threat}
                  </div>

                  <div className="text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-800/40 p-2 rounded">
                    <strong>Action 1:</strong> {item.recommended_first_step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recommended Actions & Evacuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-5 space-y-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Command Directives</span>
              </h3>
              <div className="space-y-2">
                {plan.recommended_actions.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#090d18] border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="font-bold text-cyan-400 font-mono">{idx + 1}.</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Evacuation Considerations</span>
              </h3>
              <div className="space-y-2">
                {plan.evacuation_considerations.map((evac, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#090d18] border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="font-bold text-indigo-400 font-mono">•</span>
                    <span>{evac}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Resource Allocation Matrix */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Recommended Emergency Resource Deployment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {plan.resource_allocation.map((res, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#090d18] border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-300 block">{res.resource}</span>
                  <div className="text-white text-sm font-semibold">{res.allocation}</div>
                  <div className="text-[11px] text-slate-500">Staging: {res.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Citizen Communication Draft */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Citizen-Friendly Public Safety Advisory Draft</span>
            </h3>
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs text-sky-200 leading-relaxed">
              {plan.citizen_communication_draft}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
            {plan.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
