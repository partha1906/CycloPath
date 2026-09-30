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
    { id: 'ai_agent', label: t.nav_ai_agent, icon: Bot },
    { id: 'routing', label: t.nav_routing, icon: Route },
    { id: 'inspector', label: t.nav_inspector, icon: Camera },
    { id: 'alerts', label: t.nav_alerts, icon: BellRing, badge: alertCount },
    { id: 'reports', label: t.nav_reports, icon: FileText },
    { id: 'data_sources', label: t.nav_data_sources, icon: Database },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <aside className="w-16 md:w-60 bg-white border-r border-slate-200 flex flex-col justify-between py-4 select-none shrink-0 shadow-xs">
      <div className="space-y-1 px-3">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase hidden md:block">
          Command Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition group relative ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                }`} />
                <span className="hidden md:block truncate text-left">
                  {item.label}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1.5">
                {item.badge && item.badge > 0 ? (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              {/* Tooltip for small screens */}
              <div className="absolute left-16 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition z-50 md:hidden whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Status Box */}
      <div className="px-3 hidden md:block">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-medium">Model Inference</span>
            <span className="text-emerald-700 font-semibold">Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mb-2 truncate">
            Surrogate RF + Gemini 2.5
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-slate-800 h-full w-[88%] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
