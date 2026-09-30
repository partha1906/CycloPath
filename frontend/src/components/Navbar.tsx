import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Globe2, 
  UserCheck, 
  Bell, 
  Layers, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  alertCount: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  userRole,
  setUserRole,
  alertCount,
  onOpenSettings
}) => {
  const t = translations[language];

  return (
    <header className="w-full bg-[#090d16] border-b border-[#1e293b] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Brand & Emblem */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setCurrentTab('dashboard')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-950/40 relative">
          <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-pulse"></div>
          {/* Stylized Cyclone Icon */}
          <svg className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z"/>
            <path d="M12 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              {t.app_title}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              INDIA V1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[280px]">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0e1422] border border-[#1e293b]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-400 font-semibold tracking-wide">
            {t.status_operational}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span className="font-medium">
            {t.active_scenario}
          </span>
          <span className="text-[10px] bg-red-500/20 px-1.5 py-0.2 rounded border border-red-500/30 font-bold">
            {t.demo_badge}
          </span>
        </div>
      </div>

      {/* Right Tools: Language, Role Selector, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <div className="flex items-center bg-[#0e1422] border border-[#1e293b] rounded-lg p-0.5 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          <button 
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('hi')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'hi' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            हिंदी
          </button>
          <button 
            onClick={() => setLanguage('mr')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'mr' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            मराठी
          </button>
        </div>

        {/* User Persona Switcher */}
        <div className="hidden md:flex items-center bg-[#0e1422] border border-[#1e293b] rounded-lg px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400 mr-2" />
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
          >
            <option value="Disaster_Authority" className="bg-[#0e1422] text-slate-200">{t.role_authority}</option>
            <option value="Municipal_Officer" className="bg-[#0e1422] text-slate-200">{t.role_municipal}</option>
            <option value="First_Responder" className="bg-[#0e1422] text-slate-200">{t.role_responder}</option>
            <option value="Public_Citizen" className="bg-[#0e1422] text-slate-200">{t.role_public}</option>
          </select>
        </div>

        {/* Alerts Bell */}
        <button 
          onClick={() => setCurrentTab('alerts')}
          className="relative p-2 rounded-lg bg-[#0e1422] border border-[#1e293b] hover:border-slate-600 text-slate-300 transition"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* Landing Page Trigger */}
        <button 
          onClick={() => setCurrentTab('landing')}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
            currentTab === 'landing'
              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
              : 'bg-[#0e1422] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-500'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Overview</span>
        </button>
      </div>
    </header>
  );
};
