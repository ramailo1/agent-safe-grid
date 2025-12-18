
import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  MessageSquareCode,
  FileText,
  Settings,
  Activity,
  Menu,
  X,
  Lock,
  User as UserIcon,
  CreditCard,
  Users,
  LogOut,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { AuthSession } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  session: AuthSession;
  onLogout: () => void;
}

const SidebarItem = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg group ${active
      ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500'
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
    {label}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, session, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only Owners can see the Master Admin Center
  const isOwner = session.user.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-2 text-emerald-500 font-bold">
          <Shield className="w-6 h-6" />
          <span>{APP_NAME}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Organization Switcher / Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xl mb-4">
                <Shield className="w-7 h-7" />
                <span>{APP_NAME}</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-emerald-900 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {session.organization.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{session.organization.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{session.organization.tier} Plan</div>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Platform
              </div>
              <SidebarItem icon={LayoutDashboard} label="Overview" id="dashboard" active={activeTab === 'dashboard'} onClick={onTabChange} />
              <SidebarItem icon={MessageSquareCode} label="Unified Playground" id="playground" active={activeTab === 'playground'} onClick={onTabChange} />
              <SidebarItem icon={Activity} label="Robustness Lab" id="robustness" active={activeTab === 'robustness'} onClick={onTabChange} />

              <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Governance
              </div>
              <SidebarItem icon={FileText} label="Audit Logs" id="audit" active={activeTab === 'audit'} onClick={onTabChange} />
              <SidebarItem icon={Lock} label="Policies & Safety" id="policies" active={activeTab === 'policies'} onClick={onTabChange} />
              <SidebarItem icon={Settings} label="Resources" id="settings" active={activeTab === 'settings'} onClick={onTabChange} />

              <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Organization
              </div>
              <SidebarItem icon={Users} label="Team" id="team" active={activeTab === 'team'} onClick={onTabChange} />
              <SidebarItem icon={CreditCard} label="Billing & Plan" id="billing" active={activeTab === 'billing'} onClick={onTabChange} />

              {isOwner && (
                <>
                  <div className="px-4 mt-8 mb-2 text-xs font-semibold text-purple-400/70 uppercase tracking-wider">
                    Master Admin
                  </div>
                  <SidebarItem icon={Briefcase} label="Control Center" id="admin" active={activeTab === 'admin'} onClick={onTabChange} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-200 truncate w-28">{session.user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{session.user.role}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 relative">
          {/* Background Grid Effect */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

          <div className="relative z-10 p-6 lg:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
