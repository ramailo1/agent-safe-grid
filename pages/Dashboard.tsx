import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, ShieldAlert, Zap, Activity } from 'lucide-react';
import { MeteringStats } from '../types';

const data = [
  { name: '00:00', tokens: 4000, cost: 0.4, violations: 0 },
  { name: '04:00', tokens: 3000, cost: 0.3, violations: 1 },
  { name: '08:00', tokens: 2000, cost: 0.2, violations: 0 },
  { name: '12:00', tokens: 2780, cost: 0.28, violations: 2 },
  { name: '16:00', tokens: 1890, cost: 0.19, violations: 0 },
  { name: '20:00', tokens: 2390, cost: 0.24, violations: 1 },
  { name: '23:59', tokens: 3490, cost: 0.35, violations: 0 },
];

interface DashboardProps {
  stats: MeteringStats;
}

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        <p className="text-xs text-slate-500 mt-2">{sub}</p>
      </div>
      <div className={`p-3 rounded-lg bg-slate-800/50 ${color.replace('from-', 'text-').split(' ')[0].replace('bg-', 'text-')}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-slate-400">Real-time monitoring of AI agent fleet across all providers.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Spend (Month)" 
          value={`$${stats.totalCost.toFixed(4)}`} 
          sub={`${((100 - stats.budgetRemaining)).toFixed(1)}% of budget used`}
          icon={DollarSign} 
          color="from-emerald-500 to-emerald-900" 
        />
        <StatCard 
          title="Token Usage" 
          value={stats.totalTokens.toLocaleString()} 
          sub="Across Gemini, OpenAI, Llama"
          icon={Zap} 
          color="from-blue-500 to-blue-900" 
        />
        <StatCard 
          title="Safety Interventions" 
          value="12" 
          sub="PII Redacted & Jailbreaks Blocked"
          icon={ShieldAlert} 
          color="from-rose-500 to-rose-900" 
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          sub="All adapters operational"
          icon={Activity} 
          color="from-purple-500 to-purple-900" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Real-time Token Consumption</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#10b981" fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Safety Violations by Hour</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                />
                <Bar dataKey="violations" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};