
import { User, Organization, Subscription, TeamMember } from "../types";
import { api } from "./api";
import { clearSensitiveData, warnAboutLocalStorage } from "../utils/security";

export interface AuthSession {
  user: User;
  organization: Organization;
  subscription: Subscription;
  token: string;
}

const SESSION_KEY = 'saas_session';

export const authService = {

  /**
   * Register a new Organization and Owner via API
   */
  register: async (email: string, password: string, orgName: string): Promise<AuthSession> => {
    try {
      const session = await api<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, orgName })
      });

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      warnAboutLocalStorage(); // Warn on first use
      return session;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  /**
   * Login via API
   */
  login: async (email: string, password: string): Promise<AuthSession> => {
    try {
      const session = await api<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!session || !session.token) {
        throw new Error("Invalid session response from server");
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      warnAboutLocalStorage(); // Warn on first use
      return session;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: async () => {
    const session = authService.getSession();
    const tenantId = session?.organization?.id;

    // Clear sensitive data
    clearSensitiveData(tenantId);

    // Clear session
    localStorage.removeItem(SESSION_KEY);

    console.log('[Auth] User logged out, sensitive data cleared');
  },

  getSession: (): AuthSession | null => {
    const str = localStorage.getItem(SESSION_KEY);
    return str ? JSON.parse(str) : null;
  },

  getToken: (): string | null => {
    const session = authService.getSession();
    return session?.token || null;
  },

  /**
   * Fetch Team Members
   */
  getTeamMembers: async (orgId: string): Promise<TeamMember[]> => {
    // Mock fallback for now until endpoint exists
    return [
      { id: 'u1', email: 'alice@corp.com', name: 'Alice Admin', role: 'owner', organizationId: orgId, status: 'active' },
    ];
  }
};
