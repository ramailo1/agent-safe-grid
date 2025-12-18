
import React, { useState, useEffect } from 'react';
import {
  DollarSign, Users, CreditCard,
  CheckCircle2, AlertTriangle, Lock, Search, Filter,
  Edit2, Trash2
} from 'lucide-react';
import { AuthSession } from '../services/authService';
import { adminService } from '../services/adminService';
import { GlobalUser, PlanConfig } from '../types';
import { PayoutDashboard } from './PayoutDashboard';

interface AdminDashboardProps {
  session: AuthSession;
  onAuditLog: (entry: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onAuditLog }) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'plans' | 'users'>('revenue');
  const [loading, setLoading] = useState(true);

  // Data State
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [users, setUsers] = useState<GlobalUser[]>([]);

  // UI State
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // We no longer fetch payout/revenue data here; the PayoutDashboard component handles it self-contained.
        const [pl, us] = await Promise.all([
          adminService.getPlans(),
          adminService.getGlobalUsers()
        ]);
        setPlans(pl);
        setUsers(us);
      } catch (e) {
        console.error("Failed to load admin data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session.organization.id]);

  // --- Handlers ---

  const handlePlanUpdate = async () => {
    if (!editingPlan) return;
    await adminService.updatePlan(editingPlan);
    setPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));

    // Audit Log
    onAuditLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: 'UPDATE_PLAN',
      user: session.user.email,
      details: `Updated plan configuration for ${editingPlan.name}`,
      status: 'success',
      hash: 'admin-action'
    });

    setEditingPlan(null);
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'suspend') await adminService.toggleUserStatus(userId, 'suspended');
    if (action === 'activate') await adminService.toggleUserStatus(userId, 'active');
    if (action === 'delete') await adminService.deleteUser(userId);

    // Optimistic Update
    if (action === 'delete') {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action === 'suspend' ? 'suspended' : 'active' } : u));
    }

    onAuditLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: `USER_${action.toUpperCase()}`,
      user: session.user.email,
      details: `${action.toUpperCase()} user ${userId}`,
      status: 'success',
      hash: 'admin-action'
    });
  };

  // --- Access Control ---
  if (session.user.role !== 'owner') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-center p-4">
        <div className="p-4 bg-rose-500/10 rounded-full mb-4">
          <Lock className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">403 Forbidden</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access the Master Admin Control Center.
          This area is restricted to the platform owner.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Admin Console...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Master Control Center</h1>
          <p className="text-slate-400">Platform-wide administration, revenue tracking, and plan configuration.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-900/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> System Operational
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'revenue'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <DollarSign className="w-4 h-4" /> Revenue & Payouts
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'plans'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <CreditCard className="w-4 h-4" /> Plans & Pricing
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <Users className="w-4 h-4" /> Global Users
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* --- REVENUE SECTION (Integrated PayoutDashboard) --- */}
        {activeTab === 'revenue' && (
          // Render the full PayoutDashboard embedded. 
          // This gives full functionality (Bank management, Gateways, History) directly in the Admin tab.
          <PayoutDashboard session={session} embedded={true} />
        )}

        {/* --- PLANS SECTION --- */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-slate-900/50 border ${plan.isActive ? 'border-slate-700' : 'border-slate-800 opacity-60'} rounded-xl p-6 backdrop-blur-sm relative`}>
                  {!plan.isActive && (
                    <div className="absolute top-4 right-4 bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-xs font-bold">
                      INACTIVE
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      {plan.tierId === 'free' && <Users className="w-6 h-6" />}
                      {plan.tierId === 'pro' && <AlertTriangle className="w-6 h-6" />}
                      {plan.tierId === 'enterprise' && <DollarSign className="w-6 h-6" />}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span>Tokens</span>
                      <span className="font-mono text-white">{typeof plan.limits.tokens === 'number' ? plan.limits.tokens.toLocaleString() : 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span>Users</span>
                      <span className="font-mono text-white">{plan.limits.users}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span>Storage</span>
                      <span className="font-mono text-white">{plan.limits.storageGB} GB</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Config
                    </button>
                    <button
                      onClick={async () => {
                        const updated = { ...plan, isActive: !plan.isActive };
                        await adminService.updatePlan(updated);
                        setPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${plan.isActive ? 'bg-rose-900/20 text-rose-400 hover:bg-rose-900/30' : 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30'}`}
                    >
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- USERS SECTION --- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search users by email, name or organization..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 appearance-none min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="owner">Owners Only</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Organization</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users
                    .filter(u =>
                      (userSearch === '' || u.email.includes(userSearch) || u.organizationName.includes(userSearch)) &&
                      (userFilter === 'all' || u.status === userFilter || u.role === userFilter)
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">{u.organizationName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700 capitalize">{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.status === 'active' ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.status === 'active' ? (
                              <button
                                onClick={() => handleUserAction(u.id, 'suspend')}
                                className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded" title="Suspend"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(u.id, 'activate')}
                                className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded" title="Activate"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(u.id, 'delete')}
                              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded" title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit Plan: {editingPlan.name}</h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Price (Monthly)</label>
                  <input
                    type="number"
                    data-testid="price-input"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Users</label>
                  <input
                    type="text"
                    value={editingPlan.limits.users}
                    onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, users: e.target.value === 'Unlimited' ? 'Unlimited' : parseInt(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tokens</label>
                  <input
                    type="text"
                    value={editingPlan.limits.tokens}
                    onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, tokens: e.target.value === 'Unlimited' ? 'Unlimited' : parseInt(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <label className="text-xs text-slate-400 block mb-3 uppercase tracking-wider font-bold">Features</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPlan.features.standardSupport} onChange={(e) => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, standardSupport: e.target.checked } })} className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-sm text-slate-300">Standard Support</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPlan.features.prioritySupport} onChange={(e) => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, prioritySupport: e.target.checked } })} className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-sm text-slate-300">Priority Support</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPlan.features.advancedAnalytics} onChange={(e) => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, advancedAnalytics: e.target.checked } })} className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-sm text-slate-300">Advanced Analytics</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPlan.features.sso} onChange={(e) => setEditingPlan({ ...editingPlan, features: { ...editingPlan.features, sso: e.target.checked } })} className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-sm text-slate-300">SSO / SAML</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanUpdate}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
