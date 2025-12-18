
import { GlobalUser, PlanConfig, AdminAction } from "../types";

const MOCK_USERS: GlobalUser[] = [
  { id: 'u1', email: 'alice@acme.com', name: 'Alice Owner', role: 'owner', organizationId: 'org_1', organizationName: 'Acme Corp', status: 'active', createdAt: Date.now() - 10000000 },
  { id: 'u2', email: 'bob@startup.io', name: 'Bob Founder', role: 'owner', organizationId: 'org_2', organizationName: 'Startup IO', status: 'active', createdAt: Date.now() - 5000000 },
  { id: 'u3', email: 'charlie@dev.net', name: 'Charlie Dev', role: 'admin', organizationId: 'org_1', organizationName: 'Acme Corp', status: 'suspended', createdAt: Date.now() - 2000000 },
  { id: 'u4', email: 'dave@enterprise.co', name: 'Dave Admin', role: 'admin', organizationId: 'org_3', organizationName: 'Big Enterprise', status: 'active', createdAt: Date.now() - 8000000 },
  { id: 'u5', email: 'eve@hacker.net', name: 'Eve Malicious', role: 'analyst', organizationId: 'org_2', organizationName: 'Startup IO', status: 'suspended', createdAt: Date.now() - 100000 },
];

const INITIAL_PLANS: PlanConfig[] = [
  {
    id: 'p_free',
    tierId: 'free',
    name: 'Starter Free',
    price: 0,
    currency: 'USD',
    limits: { tokens: 100000, users: 1, storageGB: 1 },
    features: { standardSupport: false, prioritySupport: false, advancedAnalytics: false, customIntegrations: false, sso: false },
    isActive: true
  },
  {
    id: 'p_pro',
    tierId: 'pro',
    name: 'Pro Security',
    price: 99,
    currency: 'USD',
    limits: { tokens: 5000000, users: 5, storageGB: 50 },
    features: { standardSupport: true, prioritySupport: false, advancedAnalytics: true, customIntegrations: false, sso: false },
    isActive: true
  },
  {
    id: 'p_ent',
    tierId: 'enterprise',
    name: 'Enterprise Grid',
    price: 499,
    currency: 'USD',
    limits: { tokens: 'Unlimited', users: 'Unlimited', storageGB: 1000 },
    features: { standardSupport: true, prioritySupport: true, advancedAnalytics: true, customIntegrations: true, sso: true },
    isActive: true
  }
];

import { api } from './api';

// ... (keep MOCK_USERS for now as we are focusing on plans)

export const adminService = {
  getGlobalUsers: async (): Promise<GlobalUser[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_USERS]), 600));
  },

  getPlans: async (): Promise<PlanConfig[]> => {
    try {
      // Fetch all plans (including inactive ones) for admin view
      return await api<PlanConfig[]>('/pricing/plans?all=true');
    } catch (e) {
      console.error("Failed to fetch admin plans", e);
      return [];
    }
  },

  updatePlan: async (plan: PlanConfig): Promise<void> => {
    try {
      await api(`/pricing/plans/${plan.id}`, {
        method: 'PUT',
        body: JSON.stringify(plan)
      });
    } catch (e) {
      console.error("Failed to update plan", e);
      throw e;
    }
  },

  toggleUserStatus: async (userId: string, status: 'active' | 'suspended'): Promise<void> => {
    console.log(`Setting user ${userId} status to ${status}`);
    // In real app, call API
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    console.log(`Updating user ${userId} role to ${role}`);
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  deleteUser: async (userId: string): Promise<void> => {
    console.log(`Deleting user ${userId}`);
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  logAdminAction: async (action: AdminAction): Promise<void> => {
    console.log('[ADMIN AUDIT]', action);
    // Persist to audit log
  }
};
