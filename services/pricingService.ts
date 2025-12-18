import { PlanConfig, Subscription, PaymentGatewayType } from "../types";
import { api } from './api';

export const pricingService = {
  /**
   * Fetch all active plans from the backend API
   */
  getPlans: async (): Promise<PlanConfig[]> => {
    try {
      return await api<PlanConfig[]>('/pricing/plans');
    } catch (e) {
      console.error("Failed to fetch plans", e);
      return []; 
    }
  },

  getPlanByTier: async (tierId: string): Promise<PlanConfig | undefined> => {
    const plans = await pricingService.getPlans();
    return plans.find(p => p.tierId === tierId);
  },

  /**
   * Process a subscription upgrade via Backend
   */
  upgradeSubscription: async (
    organizationId: string, 
    planId: string, 
    paymentMethod: PaymentGatewayType,
    paymentDetails: any // { token: string, ... }
  ): Promise<{ success: boolean; subscription: Subscription }> => {
    
    // Call Backend to charge card and update DB
    const response = await api<{ success: true, subscription: Subscription }>('/payments/charge', {
      method: 'POST',
      body: JSON.stringify({
        amount: 99, // In real app, fetch price from planId
        currency: 'USD',
        gateway: paymentMethod,
        token: paymentDetails.token || 'mock_token_123', // In production, this comes from Stripe.js
        planId
      })
    });

    return response;
  }
};
