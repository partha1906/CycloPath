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

  const [routingOriginAsset, setRoutingOriginAsset] = useState<InfrastructureAsset | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial Data Fetch
  const loadPlatformData = async () => {
    try {
      const [cyc, sum, asts, alrts] = await Promise.all([
        api.getCyclone(1).catch(() => null),
        api.getRiskSummary().catch(() => null),
        api.getInfrastructure().catch(() => []),
        api.getAlerts().catch(() => [])
      ]);
      setCyclone(cyc || null);
      setSummary(sum || null);
      setAssets(Array.isArray(asts) ? asts : []);
      setAlerts(Array.isArray(alrts) ? alrts : []);
    } catch (err) {
      console.error('Failed to load initial platform data:', err);
      setAssets([]);
      setAlerts([]);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleAlertAck = (id: number) => {
    setAlerts(prev => (Array.isArray(prev) ? prev : []).map(a => a.id === id ? { ...a, acknowledged: true } : a));
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
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
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
      <div className="flex flex-1 min-h-0">
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
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto relative">
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
            <EmergencyRouting 
              assets={assets}
              initialOriginAsset={routingOriginAsset}
            />
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
            <div className="p-8 flex flex-col items-center justify-center max-w-xl mx-auto my-auto space-y-4 text-center">
              <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 w-full">
                <h2 className="text-xl font-bold text-slate-900">Risk Engine Configuration</h2>
                <p className="text-sm text-slate-600">
                  Adjust multi-hazard weighting factors for cyclone exposure, surge depth, structural aging, and accessibility risks.
                </p>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-semibold text-sm text-white shadow-xs transition cursor-pointer"
                >
                  Configure Risk Engine Weights
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Asset Explainability Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onPlanRouteForAsset={(asset) => {
            setRoutingOriginAsset(asset);
            setCurrentTab('routing');
          }}
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
