import { RevenueStats, Transaction, PayoutRecord, BankAccount, PaymentGatewayConfig } from "../types";
import { api } from './api';

// LocalStorage keys
const BANK_ACCOUNTS_KEY = 'agent_safe_bank_accounts';
const PAYMENT_GATEWAYS_KEY = 'agent_safe_payment_gateways';

export const payoutService = {

  getRevenueStats: async (tenantId: string): Promise<RevenueStats> => {
    // This would be a real aggregation query in backend
    return {
      totalRevenueMonth: 4250.00,
      availablePayout: 3875.50,
      pendingBalance: 500.00,
      totalRevenueAllTime: 25430.00,
      revenueHistory: [{ date: 'Oct', amount: 4250 }],
      revenueByPlan: [{ name: 'Enterprise', value: 15000 }]
    };
  },

  getTransactions: async (tenantId: string): Promise<Transaction[]> => {
    return []; // Would fetch from /api/transactions
  },

  getPayoutHistory: async (tenantId: string): Promise<PayoutRecord[]> => {
    return []; // Would fetch from /api/payouts/history
  },

  getBankAccounts: async (tenantId: string): Promise<BankAccount[]> => {
    try {
      return await api<BankAccount[]>('/payouts/accounts');
    } catch (e) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`${BANK_ACCOUNTS_KEY}_${tenantId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  saveBankAccount: async (tenantId: string, account: Partial<BankAccount>): Promise<BankAccount> => {
    const newAccount: BankAccount = {
      id: account.id || `bank_${Date.now()}`,
      tenantId,
      bankName: account.bankName || '',
      last4: account.accountNumber?.slice(-4) || '0000',
      accountHolderName: account.accountHolderName || '',
      type: 'checking',
      country: (account.country || 'US').toUpperCase(), // Ensure uppercase
      currency: (account.currency || 'USD').toUpperCase(), // Ensure uppercase
      isDefault: account.isDefault || false,
      status: 'verified',
      routingNumber: account.routingNumber,
      accountNumber: account.accountNumber
    };

    try {
      // Send properly formatted data to backend
      const payload = {
        bankName: account.bankName,
        accountHolderName: account.accountHolderName,
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        country: (account.country || 'US').toUpperCase(),
        currency: (account.currency || 'USD').toUpperCase()
      };

      console.log('[PayoutService] Sending bank account data:', { ...payload, accountNumber: '***', routingNumber: '***' });

      await api('/payouts/accounts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('[PayoutService] API call failed, falling back to localStorage:', e);
      // Fallback to localStorage
      const existing = await payoutService.getBankAccounts(tenantId);
      const updated = account.id
        ? existing.map(b => b.id === account.id ? newAccount : b)
        : [...existing, newAccount];
      localStorage.setItem(`${BANK_ACCOUNTS_KEY}_${tenantId}`, JSON.stringify(updated));
    }

    return newAccount;
  },

  deleteBankAccount: async (tenantId: string, accountId: string): Promise<void> => {
    try {
      await api(`/payouts/accounts/${accountId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('[PayoutService] Failed to delete bank account via API, using localStorage:', e);
      const existing = JSON.parse(localStorage.getItem(`${BANK_ACCOUNTS_KEY}_${tenantId}`) || '[]');
      const updated = existing.filter((b: BankAccount) => b.id !== accountId);
      localStorage.setItem(`${BANK_ACCOUNTS_KEY}_${tenantId}`, JSON.stringify(updated));
    }
  },

  getPaymentGateways: async (tenantId: string): Promise<PaymentGatewayConfig[]> => {
    try {
      return await api<PaymentGatewayConfig[]>('/gateways');
    } catch (e) {
      console.error('[PayoutService] Failed to fetch gateways, using localStorage:', e);
      const stored = localStorage.getItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  savePaymentGateway: async (tenantId: string, gateway: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> => {
    try {
      const payload = {
        type: gateway.type || 'stripe',
        name: gateway.name || `${gateway.type} Gateway`,
        isEnabled: gateway.isEnabled ?? true,
        isDefault: gateway.isDefault ?? false,
        credentials: gateway.credentials || {}
      };

      console.log('[PayoutService] Saving payment gateway:', { ...payload, credentials: '***' });

      if (gateway.id) {
        const updated = await api<PaymentGatewayConfig>(`/gateways/${gateway.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        return { ...gateway, ...updated } as PaymentGatewayConfig;
      } else {
        const created = await api<PaymentGatewayConfig>('/gateways', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        return { ...gateway, ...created } as PaymentGatewayConfig;
      }
    } catch (e) {
      console.error('[PayoutService] Gateway API failed, using localStorage fallback:', e);
      const newGateway: PaymentGatewayConfig = {
        id: gateway.id || `gw_${Date.now()}`,
        tenantId,
        type: gateway.type || 'stripe',
        name: gateway.name || `${gateway.type} Gateway`,
        isEnabled: gateway.isEnabled ?? true,
        isDefault: gateway.isDefault ?? false,
        credentials: gateway.credentials || {}
      };

      const existing = JSON.parse(localStorage.getItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`) || '[]');
      const updated = gateway.id
        ? existing.map((g: PaymentGatewayConfig) => g.id === gateway.id ? newGateway : g)
        : [...existing, newGateway];
      localStorage.setItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`, JSON.stringify(updated));

      return newGateway;
    }
  },

  deletePaymentGateway: async (tenantId: string, gatewayId: string): Promise<void> => {
    let deleted = false;

    try {
      await api(`/gateways/${gatewayId}`, { method: 'DELETE' });
      deleted = true;
      console.log('[PayoutService] Gateway deleted via API successfully');
    } catch (e) {
      console.error('[PayoutService] Failed to delete gateway via API, using localStorage:', e);
    }

    // Always update localStorage to ensure UI consistency
    const existing = JSON.parse(localStorage.getItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`) || '[]');
    const updated = existing.filter((g: PaymentGatewayConfig) => g.id !== gatewayId);
    localStorage.setItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`, JSON.stringify(updated));

    if (!deleted) {
      console.log('[PayoutService] Gateway deleted from localStorage');
    }
  },

  getEnabledPaymentGateways: async (tenantId: string): Promise<PaymentGatewayConfig[]> => {
    try {
      return await api<PaymentGatewayConfig[]>('/gateways/enabled');
    } catch (e) {
      console.error('[PayoutService] Failed to fetch enabled gateways, using localStorage fallback:', e);
      // Fallback to all gateways filtered by isEnabled
      const stored = localStorage.getItem(`${PAYMENT_GATEWAYS_KEY}_${tenantId}`);
      const allGateways = stored ? JSON.parse(stored) : [];
      return allGateways.filter((g: PaymentGatewayConfig) => g.isEnabled);
    }
  },

  savePayoutSchedule: async (tenantId: string, schedule: any): Promise<boolean> => true,
  saveTaxConfig: async (tenantId: string, config: any): Promise<boolean> => true,
};
