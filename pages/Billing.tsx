import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Building, AlertTriangle, FileText, Lock, Loader2, X, Globe, Landmark } from 'lucide-react';
import { AuthSession } from '../services/authService';
import { pricingService } from '../services/pricingService';
import { PlanConfig, PaymentGatewayType, PaymentGatewayConfig } from '../types';
import { useToast } from '../components/Toast';
import { payoutService } from '../services/payoutService';

interface BillingProps {
   session: AuthSession;
}

export const Billing: React.FC<BillingProps> = ({ session }) => {
   const toast = useToast();
   const [plans, setPlans] = useState<PlanConfig[]>([]);
   const [currentPlanConfig, setCurrentPlanConfig] = useState<PlanConfig | null>(null);
   const [loadingPlans, setLoadingPlans] = useState(true);

   // Payment Gateway State
   const [availableGateways, setAvailableGateways] = useState<PaymentGatewayConfig[]>([]);
   const [loadingGateways, setLoadingGateways] = useState(true);

   // Modal State
   const [showUpgradeModal, setShowUpgradeModal] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
   const [paymentMethod, setPaymentMethod] = useState<PaymentGatewayType>('stripe');
   const [isProcessing, setIsProcessing] = useState(false);

   // Form State for "Stripe Elements" simulation
   const [cardHolder, setCardHolder] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         // Fetch pricing plans
         const allPlans = await pricingService.getPlans();
         setPlans(allPlans);
         const current = allPlans.find(p => p.tierId === session.organization.tier);
         setCurrentPlanConfig(current || allPlans[0]);
         setLoadingPlans(false);

         // Fetch enabled payment gateways
         try {
            const gateways = await payoutService.getEnabledPaymentGateways(session.organization.id);
            // Transform backend response (gateway_type) to frontend format (type)
            const transformed = gateways.map(g => ({
               ...g,
               type: (g as any).gateway_type || g.type,
               tenantId: (g as any).tenant_id || g.tenantId
            }));
            setAvailableGateways(transformed);
            // Set default payment method to first available gateway
            if (transformed.length > 0) {
               const defaultGateway = transformed.find(g => g.isDefault) || transformed[0];
               setPaymentMethod(defaultGateway.type);
            }
         } catch (e) {
            console.error('Failed to fetch payment gateways:', e);
         } finally {
            setLoadingGateways(false);
         }
      };
      fetchData();
   }, [session.organization.tier, session.organization.id]);

   const handleUpgradeClick = (plan: PlanConfig) => {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
   };

   const processPayment = async () => {
      if (!selectedPlan) return;
      setIsProcessing(true);

      setIsProcessing(true);
      try {
         // Simulate payment processing
         await new Promise(resolve => setTimeout(resolve, 2000));

         // Tokenization would happen here with Stripe/Square SDKs
         // const token = await stripe.createToken(...)
         const mockToken = `tok_${paymentMethod}_${Date.now()}`;

         await pricingService.upgradeSubscription(
            session.organization.id,
            selectedPlan.id,
            paymentMethod,
            { token: mockToken, cardHolder }
         );

         toast.success("Upgrade Successful!", `Successfully upgraded to ${selectedPlan.name}!`);
         setShowUpgradeModal(false);
         // window.location.reload(); // Reload if necessary after a successful upgrade
      } catch (e: any) {
         toast.error("Payment Failed", e.message || "An error occurred during upgrade");
      } finally {
         setIsProcessing(false);
      }
   };

   // ... (Keep UsageBar and Render Logic same as before, focusing on Modal changes below) ...
   const UsageBar = ({ label, current, max }: { label: string, current: number | string, max: number | string }) => {
      const numMax = typeof max === 'number' ? max : 1000000;
      const numCurrent = typeof current === 'number' ? current : 0;
      const percentage = typeof max === 'number' ? (numCurrent / numMax) * 100 : (numCurrent > 0 ? 50 : 0);
      return (
         <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
               <span className="text-slate-400">{label}</span>
               <span className="text-slate-200">{typeof current === 'number' ? current.toLocaleString() : current} / {typeof max === 'number' ? max.toLocaleString() : max}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
         </div>
      );
   };

   if (loadingPlans) return <div className="p-10 text-center text-slate-500">Loading subscription details...</div>;

   if (!plans || plans.length === 0) {
      return (
         <div className="p-10 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Plans Available</h2>
            <p className="text-slate-400">Contact support to configure billing plans.</p>
         </div>
      );
   }

   return (
      <div className="space-y-8 relative">
         <div>
            <h1 className="text-3xl font-bold text-white mb-2">Subscription & Billing</h1>
            <p className="text-slate-400">Manage your organization's plan and payment methods.</p>
         </div>

         {/* Existing Dashboard UI code ... omitting for brevity, assuming previous layout is kept, focusing on Modal */}

         {/* Plans Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
               const isCurrent = session.organization.tier === plan.tierId;
               return (
                  <div key={plan.id} className={`rounded-xl p-6 border transition-all relative flex flex-col ${isCurrent ? 'bg-slate-900/80 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-900/30 border-slate-800 hover:border-slate-600'}`}>
                     <div className="text-lg font-bold text-white capitalize mb-1">{plan.name}</div>
                     <div className="text-3xl font-bold text-white mb-4">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                     <button onClick={() => handleUpgradeClick(plan)} disabled={isCurrent} className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${isCurrent ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-white text-black hover:bg-slate-200'}`}>
                        {isCurrent ? 'Active' : 'Upgrade'}
                     </button>
                  </div>
               );
            })}
         </div>

         {/* --- UPGRADE CHECKOUT MODAL --- */}
         {showUpgradeModal && selectedPlan && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Lock className="w-5 h-5" /></div>
                        <div><h3 className="text-xl font-bold text-white">Secure Checkout</h3></div>
                     </div>
                     <button onClick={() => setShowUpgradeModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-bold text-lg">{selectedPlan.name}</span>
                              <span className="text-emerald-400 font-mono font-bold">${selectedPlan.price}/mo</span>
                           </div>
                           <div className="text-xs text-slate-500">Upgrading from {currentPlanConfig?.name}</div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                           <span className="text-white">Total due today</span>
                           <span className="text-xl font-bold text-white">${selectedPlan.price.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Method</h4>

                        {loadingGateways ? (
                           <div className="text-center text-slate-500 py-4">Loading payment methods...</div>
                        ) : availableGateways.length === 0 ? (
                           <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg text-amber-300 text-sm">
                              <AlertTriangle className="w-5 h-5 inline mr-2" />
                              No payment methods are configured. Please contact your administrator.
                           </div>
                        ) : (
                           <div className="grid grid-cols-3 gap-2 mb-4">
                              {availableGateways.map((gateway) => {
                                 const getGatewayIcon = (type: PaymentGatewayType) => {
                                    switch (type) {
                                       case 'stripe': return <CreditCard className="w-4 h-4" />;
                                       case 'square': return <div className="w-4 h-4 border-2 border-current rounded-sm"></div>;
                                       case 'wise': return <Globe className="w-4 h-4" />;
                                       case 'paypal': return <span className="font-serif font-bold italic">P</span>;
                                       case 'bank_transfer': return <Building className="w-4 h-4" />;
                                       case '2checkout': return <CreditCard className="w-4 h-4" />;
                                       default: return <CreditCard className="w-4 h-4" />;
                                    }
                                 };

                                 const getGatewayLabel = (type: PaymentGatewayType, name: string) => {
                                    if (type === 'bank_transfer') return 'Wire';
                                    return name || type;
                                 };

                                 const isSelected = paymentMethod === gateway.type;
                                 return (
                                    <button
                                       key={gateway.id}
                                       onClick={() => setPaymentMethod(gateway.type)}
                                       className={`p-2 border rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors ${isSelected
                                          ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                                          }`}
                                    >
                                       {getGatewayIcon(gateway.type)}
                                       <span className="capitalize truncate w-full text-center">
                                          {getGatewayLabel(gateway.type, gateway.name)}
                                       </span>
                                    </button>
                                 );
                              })}
                           </div>
                        )}

                        {/* Payment Forms */}
                        {(paymentMethod === 'stripe' || paymentMethod === 'square') && (
                           <div className="space-y-3 p-3 bg-slate-950 rounded border border-slate-800">
                              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                 <Lock className="w-3 h-3" />
                                 {paymentMethod === 'stripe' ? 'Stripe Elements' : 'Square Secure Payment'}
                              </div>
                              {/* Simulation of Elements */}
                              <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Card Number" />
                              <div className="grid grid-cols-2 gap-3">
                                 <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="MM/YY" />
                                 <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" placeholder="CVC" />
                              </div>
                           </div>
                        )}

                        {paymentMethod === 'wise' && (
                           <div className="p-4 bg-emerald-900/10 border border-emerald-800 rounded-lg text-center text-emerald-300 text-xs">
                              Redirecting to Wise for international transfer...
                           </div>
                        )}

                        {paymentMethod === 'paypal' && (
                           <div className="p-4 bg-blue-900/10 border border-blue-800 rounded-lg text-center text-blue-300 text-xs">
                              Redirecting to PayPal...
                           </div>
                        )}

                        <button
                           onClick={processPayment}
                           disabled={isProcessing}
                           className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                           {isProcessing ? 'Processing...' : `Pay $${selectedPlan.price.toFixed(2)}`}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
