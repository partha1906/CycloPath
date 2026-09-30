import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  Wind, 
  Sliders, 
  Bot, 
  Route, 
  Camera, 
  BellRing, 
  FileText, 
  Database, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  alertCount
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
    { id: 'risk_map', label: t.nav_risk_map, icon: Map },
    { id: 'infrastructure', label: t.nav_infrastructure, icon: Building2 },
    { id: 'cyclone_intel', label: t.nav_cyclone_intel, icon: Wind },
    { id: 'simulator', label: t.nav_simulator, icon: Sliders },
    { id: 'ai_agent', label: t.nav_ai_agent, icon: Bot, isSpecial: true },
    { id: 'routing', label: t.nav_routing, icon: Route },
    { id: 'inspector', label: t.nav_inspector, icon: Camera },
    { id: 'alerts', label: t.nav_alerts, icon: BellRing, badge: alertCount },
    { id: 'reports', label: t.nav_reports, icon: FileText },
    { id: 'data_sources', label: t.nav_data_sources, icon: Database },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <aside className="w-16 md:w-64 bg-[#0a0e1a] border-r border-[#1e293b] flex flex-col justify-between py-3 select-none flex-shrink-0">
      <div className="space-y-1 px-2">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase hidden md:block">
          COMMAND MODULES
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition group relative ${
                isActive
                  ? item.isSpecial
                    ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/30 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#161f33] text-white border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121929]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="hidden md:block truncate text-left">
                  {item.label}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1.5">
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600/80 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>

              {/* Tooltip for small screens */}
              <div className="absolute left-16 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg border border-slate-700 opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 md:hidden whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Status Box */}
      <div className="px-3 hidden md:block">
        <div className="p-3 rounded-xl bg-[#0e1422] border border-[#1e293b] text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Inference Mode</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mb-2 truncate">
            Random Forest Ensemble + Gemini
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[88%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
