import React from 'react';
import { 
  Globe2, 
  UserCheck, 
  Bell, 
  AlertTriangle,
  SlidersHorizontal,
  Home
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
    <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 select-none shadow-xs">
      {/* Brand & Emblem */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setCurrentTab('dashboard')}
      >
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
          {/* Cyclone SVG Icon */}
          <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6a6 6 0 1 0 6 6"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
              {t.app_title}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              India Coastal Swath
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[320px]">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="text-slate-700 font-medium">
            {t.status_operational}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span className="font-medium">
            {t.active_scenario}
          </span>
          <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded font-bold text-rose-800">
            {t.demo_badge}
          </span>
        </div>
      </div>

      {/* Right Tools: Language, Role Selector, Notifications, Settings */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          <button 
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('hi')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            हिंदी
          </button>
          <button 
            onClick={() => setLanguage('mr')}
            className={`px-2 py-1 rounded font-medium transition ${language === 'mr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            मराठी
          </button>
        </div>

        {/* User Persona Switcher */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-slate-800 outline-none cursor-pointer font-medium"
          >
            <option value="Disaster_Authority">{t.role_authority}</option>
            <option value="Municipal_Officer">{t.role_municipal}</option>
            <option value="First_Responder">{t.role_responder}</option>
            <option value="Public_Citizen">{t.role_public}</option>
          </select>
        </div>

        {/* Alerts Bell */}
        <button 
          onClick={() => setCurrentTab('alerts')}
          className="relative p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
          title="Formula Weights Configuration"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
        </button>

        {/* Landing Overview Button */}
        <button 
          onClick={() => setCurrentTab('landing')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
            currentTab === 'landing'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Overview</span>
        </button>
      </div>
    </header>
  );
};
