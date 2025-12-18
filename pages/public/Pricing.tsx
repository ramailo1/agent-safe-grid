
import React, { useEffect, useState } from 'react';
import { Check, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { pricingService } from '../../services/pricingService';
import { PlanConfig } from '../../types';

interface PricingProps {
  onLogin: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onLogin }) => {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const data = await pricingService.getPlans();
        setPlans(data.filter(p => p.isActive));
        setLoading(false);
    };
    load();
  }, []);

  const getIcon = (tier: string) => {
    switch(tier) {
        case 'free': return Users;
        case 'pro': return AlertTriangle;
        case 'enterprise': return DollarSign;
        default: return Users;
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading pricing...</div>;

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-400">Start for free, scale securely. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
             const Icon = getIcon(plan.tierId);
             const isPro = plan.tierId === 'pro';

             return (
              <div key={plan.id} className={`
                  bg-slate-900/50 border rounded-2xl p-8 transition-all relative flex flex-col
                  ${isPro ? 'border-emerald-500 scale-105 shadow-2xl shadow-emerald-900/20 bg-slate-900' : 'border-slate-800 hover:border-slate-600'}
              `}>
                {isPro && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                    Most Popular
                    </div>
                )}
                
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-500">/month</span>}
                </div>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                    {plan.tierId === 'free' && "Perfect for hobby projects and testing."}
                    {plan.tierId === 'pro' && "For startups and growing teams."}
                    {plan.tierId === 'enterprise' && "For large organizations and compliance."}
                </p>
                
                <button 
                    onClick={onLogin} 
                    className={`w-full py-3 font-bold rounded-lg transition-colors mb-8 ${
                        isPro 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                >
                  {plan.price === 0 ? 'Get Started' : plan.tierId === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
                
                <div className="flex-1">
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex gap-3">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> 
                            {typeof plan.limits.tokens === 'number' ? `${(plan.limits.tokens / 1000).toLocaleString()}k` : 'Unlimited'} Tokens / mo
                        </li>
                        <li className="flex gap-3">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> 
                            {plan.limits.users} User{plan.limits.users !== 1 ? 's' : ''}
                        </li>
                        <li className="flex gap-3">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> 
                            {plan.limits.storageGB} GB Storage
                        </li>
                        {plan.features.standardSupport && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Standard Support</li>}
                        {plan.features.prioritySupport && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Priority Support</li>}
                        {plan.features.advancedAnalytics && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Advanced Analytics</li>}
                        {plan.features.sso && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> SSO / SAML</li>}
                        {plan.features.customIntegrations && <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Custom Integrations</li>}
                    </ul>
                </div>
              </div>
             );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
           <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
           <div className="space-y-6">
              {[
                { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade your plan at any time from the billing settings." },
                { q: "How are tokens counted?", a: "We aggregate token usage across all providers (Gemini, OpenAI, etc.) into a unified billing view." },
                { q: "Is my data used to train models?", a: "Never. We operate with a strict zero-data-retention policy for inference. Logs are encrypted and only accessible by you." },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
                   <h4 className="font-bold text-white mb-2">{item.q}</h4>
                   <p className="text-slate-400">{item.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
