
import React from 'react';
import { ShieldCheck, Zap, Lock, Activity, CheckCircle2, ArrowRight, Globe, Cpu } from 'lucide-react';

interface HomepageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onNavigate, onLogin }) => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 lg:pt-32">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New: Multi-Region Governance Available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6">
            Secure AI Agent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Orchestration Platform</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 delay-100">
            Deploy, monitor, and secure your AI agents across any LLM provider. 
            Enterprise-grade policy enforcement, real-time cost metering, and immutable audit logs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 delay-200">
            <button 
              onClick={() => onLogin()}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-emerald-900/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-medium rounded-xl border border-slate-700 transition-all"
            >
              Request Demo
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 pt-10 border-t border-slate-800/50">
            <p className="text-sm text-slate-500 mb-6 font-medium">TRUSTED BY SECURITY TEAMS AT</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {['Acme Corp', 'Global Bank', 'TechFlow', 'SecureNet', 'HealthPlus'].map((brand) => (
                 <div key={brand} className="text-xl font-bold text-slate-300">{brand}</div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-900/30 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Everything you need to run AI securely</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Stop worrying about prompt injection, PII leakage, or unexpected bills. 
                Our grid handles the infrastructure so you can focus on intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { icon: ShieldCheck, title: 'Unified Guardrails', desc: 'Define policy once, enforce everywhere. Prevent PII leakage and jailbreaks across Gemini, OpenAI, and Llama.' },
                 { icon: Zap, title: 'Real-time Metering', desc: 'Track token usage and costs per tenant, user, or agent in real-time with hard budget stops.' },
                 { icon: Lock, title: 'Immutable Audit', desc: 'Cryptographically signed logs for every interaction. Fully compliant with SOC2, HIPAA, and GDPR.' },
                 { icon: Globe, title: 'Multi-Region', desc: 'Keep data within borders. Route traffic based on user location to comply with data residency laws.' },
                 { icon: Cpu, title: 'Model Agnostic', desc: 'Switch providers instantly without code changes. Fallback to cheaper models during high traffic.' },
                 { icon: Activity, title: 'Chaos Testing', desc: 'Automated red-teaming and canary deployments to ensure your agents perform under pressure.' },
               ].map((feature, idx) => (
                 <div key={idx} className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Social Proof / Testimonials */}
      <div className="py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div>
                  <h2 className="text-3xl font-bold text-white mb-6">
                    "The missing layer for Enterprise AI"
                  </h2>
                  <blockquote className="text-xl text-slate-300 leading-relaxed mb-8">
                    "Before Agent-SAFE Grid, we were building custom wrappers for every model. Now we have a single control plane for security, billing, and observability. It saved us months of engineering time."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                    <div>
                      <div className="text-white font-bold">Jane Doe</div>
                      <div className="text-emerald-400 text-sm">CTO @ FinTech Corp</div>
                    </div>
                  </div>
               </div>
               <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* Abstract UI representation */}
                  <div className="bg-slate-950 rounded-xl p-6 border border-slate-800/50 h-[300px] flex flex-col">
                     <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                           <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                           <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">LIVE MONITORING</div>
                     </div>
                     <div className="space-y-3">
                        <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                        <div className="h-2 bg-slate-800 rounded w-1/2"></div>
                        <div className="h-2 bg-slate-800 rounded w-full"></div>
                        <div className="h-2 bg-emerald-900/30 rounded w-5/6 border border-emerald-500/20 mt-4"></div>
                     </div>
                     <div className="mt-auto">
                        <div className="flex justify-between text-xs text-slate-500">
                           <span>Threat Detected</span>
                           <span className="text-emerald-500">Blocked</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-emerald-900/10 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to secure your agents?</h2>
          <p className="text-lg text-slate-400 mb-10">
            Join hundreds of enterprises running safe, compliant, and cost-effective AI workloads.
          </p>
          <button 
            onClick={() => onLogin()}
            className="px-10 py-4 bg-white text-slate-950 text-lg font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-xl"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};
