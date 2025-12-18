
import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, Building, Activity, Download, ExternalLink,
  Plus, Settings, CheckCircle2, AlertTriangle, Clock, ArrowUpRight,
  TrendingUp, PieChart as PieChartIcon, Lock, ShieldCheck, X, Trash2, Edit2, Globe, Key, Landmark
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { RevenueStats, Transaction, PayoutRecord, BankAccount, PayoutSchedule, TaxConfig, PaymentGatewayConfig, PaymentGatewayType } from '../types';
import { payoutService } from '../services/payoutService';
import { AuthSession } from '../services/authService';
import { useToast } from '../components/Toast';

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f43f5e'];

interface PayoutDashboardProps {
  session?: AuthSession; // Passed from App.tsx
  embedded?: boolean;    // If true, hides the main page title to fit into tabs
}

export const PayoutDashboard: React.FC<PayoutDashboardProps> = ({ session, embedded = false }) => {
  // Use session organization ID for data isolation. 
  // Fallback for demo mode if session is not fully propagated yet.
  const tenantId = session?.organization?.id || 'org_master_hq';
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'gateways' | 'settings' | 'tax'>('overview');
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Modal States ---
  const [showManageBanksModal, setShowManageBanksModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; gatewayId: string; gatewayName: string }>({ show: false, gatewayId: '', gatewayName: '' });

  // Form States
  const [editingBank, setEditingBank] = useState<Partial<BankAccount>>({});
  const [editingGateway, setEditingGateway] = useState<Partial<PaymentGatewayConfig>>({ type: 'stripe' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, t, p, b, g] = await Promise.all([
          payoutService.getRevenueStats(tenantId),
          payoutService.getTransactions(tenantId),
          payoutService.getPayoutHistory(tenantId),
          payoutService.getBankAccounts(tenantId),
          payoutService.getPaymentGateways(tenantId)
        ]);
        setStats(s);
        setTransactions(t);
        setPayouts(p);
        setBankAccounts(b);
        setGateways(g);
      } catch (e) {
        console.error("Unauthorized access or data load failure");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenantId]);

  // --- Bank Account Handlers ---
  const handleSaveBank = async () => {
    // Validation
    if (!editingBank.accountHolderName?.trim()) {
      toast?.error("Validation Error", "Account Holder Name is required");
      return;
    }
    if (!editingBank.bankName?.trim()) {
      toast?.error("Validation Error", "Bank Name is required");
      return;
    }
    if (!editingBank.routingNumber) {
      toast?.error("Validation Error", "Routing Number is required");
      return;
    }
    if (!/^\d{9}$/.test(editingBank.routingNumber)) {
      toast?.error("Validation Error", "Routing number must be exactly 9 digits (numbers only)");
      return;
    }
    if (!editingBank.accountNumber) {
      toast?.error("Validation Error", "Account Number is required");
      return;
    }

    try {
      console.log('Saving bank account:', { ...editingBank, accountNumber: '***' });
      await payoutService.saveBankAccount(tenantId, editingBank);
      const updated = await payoutService.getBankAccounts(tenantId);
      console.log('Bank accounts updated:', updated.length);
      setBankAccounts(updated);
      setEditingBank({});
      setShowManageBanksModal(false);
      toast?.success("Success!", "Bank account saved securely");
    } catch (e: any) {
      console.error('Error saving bank account:', e);
      toast?.error("Save Failed", e.message || 'Unknown error occurred');
    }
  };

  const handleEditGateway = (gateway: PaymentGatewayConfig) => {
    console.log('Editing gateway:', gateway);
    setEditingGateway(gateway);
    setShowGatewayModal(true);
  };

  const requestDeleteGateway = (gateway: PaymentGatewayConfig) => {
    setDeleteConfirm({ show: true, gatewayId: gateway.id, gatewayName: gateway.name });
  };

  const confirmDeleteGateway = async () => {
    const { gatewayId } = deleteConfirm;
    setDeleteConfirm({ show: false, gatewayId: '', gatewayName: '' });

    try {
      await payoutService.deletePaymentGateway(tenantId, gatewayId);

      // Update state directly instead of refetching from potentially failing API
      setGateways(prevGateways => prevGateways.filter(g => g.id !== gatewayId));

      toast?.success("Deleted", "Payment method removed successfully");
    } catch (e: any) {
      console.error('Error deleting gateway:', e);
      toast?.error("Delete Failed", e.message || 'Could not delete payment method');
    }
  };

  const cancelDeleteGateway = () => {
    setDeleteConfirm({ show: false, gatewayId: '', gatewayName: '' });
  };

  const handleDeleteBank = async (id: string) => {
    try {
      await payoutService.deleteBankAccount(tenantId, id);
      const updated = await payoutService.getBankAccounts(tenantId);
      setBankAccounts(updated);
      toast?.success("Deleted", "Bank account removed successfully");
    } catch (e: any) {
      console.error('Error deleting bank account:', e);
      toast?.error("Delete Failed", e.message || 'Could not delete bank account');
    }
  };

  // --- Gateway Handlers ---
  const handleSaveGateway = async () => {
    // Validation depending on type
    if (!editingGateway.name) {
      toast?.error("Validation Error", "Method Name is required");
      return;
    }

    // Type-specific validation
    if (editingGateway.type === 'bank_transfer') {
      if (!editingGateway.credentials?.bankName || !editingGateway.credentials?.accountNumber) {
        toast?.error("Validation Error", "Bank Name and Account Number are required for transfers");
        return;
      }
    } else {
      // API-based gateways
      if (!editingGateway.credentials?.apiKey) {
        toast?.error("Validation Error", "API Key is required for this gateway");
        return;
      }
    }

    // Validation
    if (!editingGateway.type) {
      toast?.error("Validation Error", "Payment gateway type is required");
      return;
    }
    if (!editingGateway.name?.trim()) {
      toast?.error("Validation Error", "Gateway name is required");
      return;
    }

    try {
      await payoutService.savePaymentGateway(tenantId, editingGateway);
      setGateways(await payoutService.getPaymentGateways(tenantId));
      setEditingGateway({});
      setShowGatewayModal(false);
      toast?.success("Success!", "Payment gateway configured successfully");
    } catch (e: any) {
      console.error('Error saving gateway:', e);
      toast?.error("Save Failed", e.message || 'Unknown error occurred');
    }
  };

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {sub}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/50 ${color.replace('from-', 'text-').split(' ')[0].replace('bg-', 'text-')}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading || !stats) {
    return <div className="p-10 text-center text-slate-500">Loading Financial Data...</div>;
  }

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Header - Conditionally rendered if not embedded */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* If embedded, we rely on the parent tab context, but we keep the button accessible */}
        {!embedded ? (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue & Payouts</h1>
            <p className="text-slate-400">Secure financial management for <span className="text-emerald-400 font-mono">{session?.organization.name}</span></p>
          </div>
        ) : (
          <div>{/* Spacer when embedded */}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditingBank({}); setShowManageBanksModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-sm font-medium transition-colors"
          >
            <Building className="w-4 h-4" /> Manage Bank Accounts
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenueMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="This Month"
          icon={DollarSign}
          color="from-emerald-500 to-emerald-900"
        />
        <StatCard
          title="Available Payout"
          value={`$${stats.availablePayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Ready to Transfer"
          icon={Building}
          color="from-blue-500 to-blue-900"
        />
        <StatCard
          title="Pending"
          value={`$${stats.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Processing"
          icon={Clock}
          color="from-amber-500 to-amber-900"
        />
        <StatCard
          title="Lifetime"
          value={`$${stats.totalRevenueAllTime.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Total Earnings"
          icon={Activity}
          color="from-purple-500 to-purple-900"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 overflow-x-auto">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {['overview', 'transactions', 'gateways', 'settings', 'tax'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize
                ${activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}
              `}
            >
              {tab === 'gateways' ? 'Payment Methods' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-6">Revenue Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueHistory}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-6">Payout History</h3>
              <div className="space-y-4">
                {payouts.length === 0 && <p className="text-slate-500 text-sm">No payouts yet.</p>}
                {payouts.map((po) => (
                  <div key={po.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-white font-bold">${po.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{new Date(po.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${po.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {po.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-600 mt-1">•••• {po.destinationBank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">{new Date(txn.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 capitalize">{txn.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-white">{txn.customerName}</td>
                    <td className="px-6 py-4 text-right font-mono text-white">${txn.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      {txn.status === 'succeeded' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Clock className="w-4 h-4 text-amber-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENT GATEWAYS TAB (Updated) */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            {/* Admin Notice */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <strong className="text-blue-100">Admin Control:</strong> Only enabled payment methods will be available to users when purchasing subscriptions in the Billing page.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { setEditingGateway({ type: 'stripe' }); setShowGatewayModal(true); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pre-defined Gateway Cards */}
              {gateways.map((gw) => (
                <div key={gw.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative group hover:border-emerald-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-md">
                      {/* Dynamic Logos */}
                      {gw.type === 'stripe' && <span className="text-indigo-600 font-bold">Stripe</span>}
                      {gw.type === 'paypal' && <span className="text-blue-600 font-bold">PayPal</span>}
                      {gw.type === 'wise' && <span className="text-emerald-600 font-bold">Wise</span>}
                      {gw.type === 'square' && <span className="text-gray-800 font-bold">Square</span>}
                      {gw.type === '2checkout' && <span className="text-orange-600 font-bold">2CO</span>}
                      {gw.type === 'bank_transfer' && <Landmark className="text-slate-800 w-6 h-6" />}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs border ${gw.isEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {gw.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-1">{gw.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    {gw.type === 'bank_transfer'
                      ? 'Direct Bank Wire'
                      : gw.isDefault ? 'Default Gateway' : 'Secondary Gateway'
                    }
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditGateway(gw)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm transition-colors"
                    >
                      Configure
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteGateway(gw)}
                      className="px-3 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Gateway"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {gateways.length === 0 && (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                  <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No payment methods configured.</p>
                  <button onClick={() => setShowGatewayModal(true)} className="text-emerald-500 hover:text-emerald-400 text-sm mt-2 font-medium">Setup First Method</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB (Placeholder for now) */}
        {activeTab === 'settings' && <div className="text-slate-500 text-center py-10">Use the Manage Bank Accounts button above.</div>}

        {/* TAX TAB (Placeholder) */}
        {activeTab === 'tax' && <div className="text-slate-500 text-center py-10">Tax configuration loaded from compliance engine.</div>}

      </div>

      {/* --- MANAGE BANK ACCOUNTS MODAL --- */}
      {showManageBanksModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" /> Manage Bank Accounts
              </h3>
              <button onClick={() => setShowManageBanksModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: List */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Existing Accounts</h4>
                {bankAccounts.map(acc => (
                  <div key={acc.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex justify-between items-center group hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded text-slate-400"><Building className="w-5 h-5" /></div>
                      <div>
                        <div className="text-white font-medium">{acc.bankName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          •••• {acc.last4}
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          {acc.currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.status === 'verified' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                      <button onClick={() => setEditingBank(acc)} className="p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteBank(acc.id)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {bankAccounts.length === 0 && <p className="text-slate-500 text-sm italic">No accounts linked.</p>}
              </div>

              {/* Right: Form */}
              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 h-fit">
                <h4 className="text-sm font-bold text-white mb-4">{editingBank.id ? 'Edit Account' : 'Add New Account'}</h4>
                <div className="space-y-3">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Account Holder Name"
                    value={editingBank.accountHolderName || ''}
                    onChange={e => setEditingBank({ ...editingBank, accountHolderName: e.target.value })}
                  />
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Bank Name (e.g. Chase)"
                    value={editingBank.bankName || ''}
                    onChange={e => setEditingBank({ ...editingBank, bankName: e.target.value })}
                  />
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Routing Number (9 digits)"
                    type="tel"
                    pattern="\d{9}"
                    maxLength={9}
                    value={editingBank.routingNumber || ''}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      setEditingBank({ ...editingBank, routingNumber: value });
                    }}
                  />
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Account Number"
                    type="password"
                    value={editingBank.accountNumber || ''}
                    onChange={e => setEditingBank({ ...editingBank, accountNumber: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={editingBank.country || 'US'} onChange={e => setEditingBank({ ...editingBank, country: e.target.value })}>
                      <option value="US">USA</option>
                      <option value="UK">UK</option>
                    </select>
                    <select className="bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={editingBank.currency || 'USD'} onChange={e => setEditingBank({ ...editingBank, currency: e.target.value })}>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveBank}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm mt-2 shadow-lg"
                  >
                    {editingBank.id ? 'Update Account' : 'Save Account'} (Secure)
                  </button>
                  {editingBank.id && (
                    <button
                      onClick={() => setEditingBank({})}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs mt-1"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD GATEWAY MODAL --- */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Configure Payment Method</h3>
              <button onClick={() => setShowGatewayModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Method Type</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white capitalize"
                  value={editingGateway.type}
                  onChange={e => setEditingGateway({ ...editingGateway, type: e.target.value as PaymentGatewayType })}
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer (Manual)</option>
                  <option value="wise">Wise</option>
                  <option value="square">Square</option>
                  <option value="2checkout">2Checkout</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Display Name</label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  value={editingGateway.name || ''}
                  onChange={e => setEditingGateway({ ...editingGateway, name: e.target.value })}
                  placeholder="e.g. Corporate Stripe"
                />
              </div>

              {/* Dynamic Fields based on Type */}
              {editingGateway.type === 'bank_transfer' ? (
                <>
                  <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-xs text-blue-300">
                    Configure the bank details that will be displayed to customers for manual wire transfers.
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bank Name</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={editingGateway.credentials?.bankName || ''}
                      onChange={e => setEditingGateway({ ...editingGateway, credentials: { ...editingGateway.credentials, bankName: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Account Holder</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={editingGateway.credentials?.accountHolderName || ''}
                      onChange={e => setEditingGateway({ ...editingGateway, credentials: { ...editingGateway.credentials, accountHolderName: e.target.value } })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Routing / Swift</label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                        value={editingGateway.credentials?.routingNumber || ''}
                        onChange={e => setEditingGateway({ ...editingGateway, credentials: { ...editingGateway.credentials, routingNumber: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Account Number</label>
                      <input
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                        value={editingGateway.credentials?.accountNumber || ''}
                        onChange={e => setEditingGateway({ ...editingGateway, credentials: { ...editingGateway.credentials, accountNumber: e.target.value } })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 block mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> API Key (Encrypted)</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                    value={editingGateway.credentials?.apiKey || ''}
                    onChange={e => setEditingGateway({ ...editingGateway, credentials: { ...editingGateway.credentials, apiKey: e.target.value } })}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editingGateway.isEnabled || false}
                  onChange={e => setEditingGateway({ ...editingGateway, isEnabled: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Enable this method</span>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowGatewayModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSaveGateway} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-bold">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-800/50 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Delete Payment Method?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-300">
                Are you sure you want to delete <span className="font-bold text-white">{deleteConfirm.gatewayName}</span>?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={cancelDeleteGateway}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGateway}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
