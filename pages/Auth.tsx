
import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';
import { Navbar } from '../components/Navbar';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', orgName: '' });

  const handleNavigate = (page: string) => {
    window.location.href = '/'; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await authService.login(formData.email, formData.password);
      } else {
        // Client-side password strength check (redundant to backend but good UX)
        if (formData.password.length < 12) {
          throw new Error("Password must be at least 12 characters long.");
        }
        await authService.register(formData.email, formData.password, formData.orgName);
      }
      onLogin();
    } catch (err: any) {
      // Handle API errors
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <Navbar 
        onNavigate={handleNavigate} 
        onLogin={() => setMode(mode === 'login' ? 'register' : 'login')} 
        activePage="" 
        simpleMode={false}
      />

      <div className="flex-1 flex items-center justify-center p-4 z-10 pt-24">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Start Your Free Trial'}
            </h1>
            <p className="text-slate-400">
              {mode === 'login' 
                ? 'Sign in to manage your secure agent grid.' 
                : 'Full-featured security harness for GenAI.'}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            {error && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {mode === 'register' && (
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-300">Organization Name</label>
                   <input 
                     required
                     type="text" 
                     placeholder="Acme Corp"
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                     value={formData.orgName}
                     onChange={e => setFormData({...formData, orgName: e.target.value})}
                   />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Work Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                {mode === 'register' && (
                  <p className="text-xs text-slate-500">
                    Must be at least 12 characters with uppercase, lowercase, number, and special char.
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                   <>
                     {mode === 'login' ? 'Sign In' : 'Create Account'}
                     <ArrowRight className="w-4 h-4" />
                   </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-center text-sm text-slate-400">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>

          {mode === 'register' && (
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                SOC2 Compliant Logs
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                PII Redaction Included
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Unified LLM Gateway
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                14-Day Free Trial
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
