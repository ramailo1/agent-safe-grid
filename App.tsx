
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Playground } from './pages/Playground';
import { AuditLogs } from './pages/AuditLogs';
import { Policies } from './pages/Policies';
import { Robustness } from './pages/Robustness';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Team } from './pages/Team';
import { Auth } from './pages/Auth';
import { AdminDashboard } from './pages/AdminDashboard';

// Public Pages
import { LandingLayout } from './components/LandingLayout';
import { Homepage } from './pages/public/Homepage';
import { Features } from './pages/public/Features';
import { Pricing } from './pages/public/Pricing';
import { Documentation } from './pages/public/Documentation';
import { Contact } from './pages/public/Contact';

import { PolicyConfig, MeteringStats, AuditLogEntry, SettingsConfig } from './types';
import { DEFAULT_POLICY_CONFIG, DEFAULT_SETTINGS } from './constants';
import { authService, AuthSession } from './services/authService';

// Simple mock encryption for storage
const encrypt = (data: string) => btoa(data);
const decrypt = (data: string) => atob(data);

type ViewState = 'landing' | 'auth' | 'app';

const App = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [publicPage, setPublicPage] = useState('home');

  // Auth State
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State (Private)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>(DEFAULT_POLICY_CONFIG);
  const [stats, setStats] = useState<MeteringStats>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0.00,
    budgetRemaining: 100.00
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = authService.getSession();
    if (savedSession) {
      setSession(savedSession);
      setCurrentView('app');
    }
    setAuthLoading(false);
  }, []);

  // Load Tenant-Specific Data when Session Changes
  useEffect(() => {
    if (session) {
      const orgKey = `agent_safe_settings_${session.organization.id}`;
      const savedSettings = localStorage.getItem(orgKey);

      if (savedSettings) {
        try {
          const parsed = JSON.parse(decrypt(savedSettings));
          setSettings(prev => ({
            ...prev,
            providers: parsed.providers || prev.providers,
            dataSources: parsed.dataSources || prev.dataSources
          }));
        } catch (e) {
          console.error("Failed to load tenant settings", e);
        }
      } else {
        // Reset to defaults for new tenant
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [session]);

  // Save Tenant-Specific Settings
  useEffect(() => {
    if (session) {
      const orgKey = `agent_safe_settings_${session.organization.id}`;
      const toSave = {
        providers: settings.providers,
        dataSources: settings.dataSources
      };
      localStorage.setItem(orgKey, encrypt(JSON.stringify(toSave)));
    }
  }, [settings, session]);

  // Handlers
  const handleUsageUpdate = (tokens: number, cost: number) => {
    setStats(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      totalTokens: prev.totalTokens + tokens,
      totalCost: prev.totalCost + cost,
      budgetRemaining: prev.budgetRemaining - cost
    }));
  };

  const handleAuditLog = (entry: AuditLogEntry) => {
    setAuditLogs(prev => [...prev, entry]);
  };

  const handleLoginSuccess = () => {
    setSession(authService.getSession());
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setCurrentView('landing');
    setPublicPage('home');
  };

  const handlePublicNavigate = (page: string) => {
    setPublicPage(page);
    setCurrentView('landing');
  };

  // --- Rendering Logic ---

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading Secure Environment...</div>;
  }

  // View: Authentication
  if (currentView === 'auth') {
    return <Auth onLogin={handleLoginSuccess} />;
  }

  // View: Landing / Public Pages
  if (currentView === 'landing') {
    return (
      <LandingLayout
        onNavigate={handlePublicNavigate}
        onLogin={() => setCurrentView('auth')}
        activePage={publicPage}
      >
        {publicPage === 'home' && <Homepage onNavigate={handlePublicNavigate} onLogin={() => setCurrentView('auth')} />}
        {publicPage === 'features' && <Features />}
        {publicPage === 'pricing' && <Pricing onLogin={() => setCurrentView('auth')} />}
        {publicPage === 'docs' && <Documentation />}
        {publicPage === 'contact' && <Contact />}
      </LandingLayout>
    );
  }

  // View: Secure App (Must have session)
  if (!session) {
    // Fallback if state gets weird
    setCurrentView('landing');
    return null;
  }

  const renderAppContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'playground':
        return (
          <Playground
            policy={policyConfig}
            onUsageUpdate={handleUsageUpdate}
            onAuditLog={handleAuditLog}
            providers={settings.providers}
          />
        );
      case 'audit':
        return <AuditLogs logs={auditLogs} />;
      case 'policies':
        return <Policies config={policyConfig} setConfig={setPolicyConfig} />;
      case 'robustness':
        return <Robustness />;
      case 'settings':
        return <Settings config={settings} setConfig={setSettings} session={session} />;
      case 'billing':
        return <Billing session={session} />;
      case 'team':
        return <Team session={session} />;
      case 'admin':
        // Route Guard: Only Owners
        if (session.user.role === 'owner') {
          return <AdminDashboard session={session} onAuditLog={handleAuditLog} />;
        } else {
          return <div className="p-10 text-center text-rose-500">Access Denied</div>;
        }
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} session={session} onLogout={handleLogout}>
      {renderAppContent()}
    </Layout>
  );
};

export default App;
