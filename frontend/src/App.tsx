import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { RiskMap } from './components/RiskMap';
import { InfrastructureCatalog } from './components/InfrastructureCatalog';
import { AssetDetailModal } from './components/AssetDetailModal';
import { CycloneIntelligence } from './components/CycloneIntelligence';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AIAgentPanel } from './components/AIAgentPanel';
import { EmergencyRouting } from './components/EmergencyRouting';
import { MultimodalInspector } from './components/MultimodalInspector';
import { AlertsPanel } from './components/AlertsPanel';
import { ReportsView } from './components/ReportsView';
import { DataSourcesView } from './components/DataSourcesView';
import { SettingsModal } from './components/SettingsModal';

import { Language } from './i18n/translations';
import { UserRole, Cyclone, RiskSummary, InfrastructureAsset, Alert } from './types';
import { api, setActiveUserRole } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<UserRole>('Disaster_Authority');

  useEffect(() => {
    setActiveUserRole(userRole);
    api.fetchDemoToken(userRole).catch(err => {
      console.warn('Auto-session token handshake notice:', err);
    });
  }, [userRole]);

  // Application Data States
  const [cyclone, setCyclone] = useState<Cyclone | null>(null);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [assets, setAssets] = useState<InfrastructureAsset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial Data Fetch
  const loadPlatformData = async () => {
    try {
      const [cyc, sum, asts, alrts] = await Promise.all([
        api.getCyclone(1),
        api.getRiskSummary(),
        api.getInfrastructure(),
        api.getAlerts()
      ]);
      setCyclone(cyc);
      setSummary(sum);
      setAssets(asts);
      setAlerts(alrts);
    } catch (err) {
      console.error('Failed to load initial platform data:', err);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleAlertAck = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  // 10-Step Interactive Demo Story Runner
  const handleLaunchDemoStory = () => {
    // 1. Switch to dashboard
    setCurrentTab('dashboard');

    setTimeout(() => {
      // 2. Switch to risk map
      setCurrentTab('risk_map');
      
      setTimeout(() => {
        // 3. Highlight vulnerable hospital
        const hosp = assets.find(a => a.asset_id === 'HOSP-OD-001') || assets[0];
        if (hosp) setSelectedAsset(hosp);
      }, 2000);
    }, 1500);
  };

  const unackAlertCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="flex flex-col w-screen h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Command Status Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        userRole={userRole}
        setUserRole={setUserRole}
        alertCount={unackAlertCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar (Hidden if landing page) */}
        {currentTab !== 'landing' && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            language={language}
            alertCount={unackAlertCount}
          />
        )}

        {/* Tab View Container */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'landing' && (
            <LandingPage
              summary={summary}
              cyclone={cyclone}
              onLaunchCommand={() => setCurrentTab('dashboard')}
              onLaunchDemoStory={handleLaunchDemoStory}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              language={language}
            />
          )}

          {currentTab === 'dashboard' && (
            <CommandCenterDashboard
              cyclone={cyclone}
              summary={summary}
              assets={assets}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              language={language}
            />
          )}

          {currentTab === 'risk_map' && (
            <RiskMap
              cyclone={cyclone}
              assets={assets}
              selectedAsset={selectedAsset}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
            />
          )}

          {currentTab === 'infrastructure' && (
            <InfrastructureCatalog
              assets={assets}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              language={language}
            />
          )}

          {currentTab === 'cyclone_intel' && (
            <CycloneIntelligence
              cyclone={cyclone}
              language={language}
            />
          )}

          {currentTab === 'simulator' && (
            <ScenarioSimulator
              onSelectAsset={(asset) => setSelectedAsset(asset)}
            />
          )}

          {currentTab === 'ai_agent' && (
            <AIAgentPanel
              language={language}
            />
          )}

          {currentTab === 'routing' && (
            <EmergencyRouting />
          )}

          {currentTab === 'inspector' && (
            <MultimodalInspector />
          )}

          {currentTab === 'alerts' && (
            <AlertsPanel
              alerts={alerts}
              onAlertAcknowledged={handleAlertAck}
              userRole={userRole}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'data_sources' && (
            <DataSourcesView />
          )}

          {currentTab === 'settings' && (
            <div className="p-8 flex items-center justify-center">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-xl transition"
              >
                Open Risk Engine Formula Configuration
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Asset Explainability Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onPlanRouteForAsset={() => setCurrentTab('routing')}
        />
      )}

      {/* Formula Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onWeightsUpdated={loadPlatformData}
        userRole={userRole}
      />
    </div>
  );
};

export default App;
