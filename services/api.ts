
import { authService } from './authService';
import { PlanConfig, BankAccount } from '../types';

// Configuration
// When running locally with Vite proxy, we use relative path '/api'
// When running in container without proxy, we might fallback to direct URL
const API_BASE_URL = '/api';

interface ApiOptions extends RequestInit {
  token?: string;
  timeout?: number;
}

/**
 * Smart API Client
 */
export const api = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const session = authService.getSession();
  const token = options.token || session?.token;
  const timeout = options.timeout || 8000; // Increased timeout for local network latencies

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.details
        ? `Validation Error: ${Array.isArray(error.details) ? error.details.join(', ') : error.details}`
        : error.error || `HTTP ${response.status}`;
      console.error(`[API] Response error:`, error);
      throw new Error(errorMessage);
    }

    return response.json();

  } catch (error: any) {
    clearTimeout(id);

    // If local proxy fails, we throw the error so the user sees it in console
    // We removed the Virtual Backend fallback for the local version to ensure
    // you are actually testing against the real database.
    console.error(`[API] Request failed: ${fullUrl}`, error);
    throw error;
  }
};
