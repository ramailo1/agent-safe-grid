
export enum Provider {
  GEMINI = 'Gemini (Google)',
  OPENAI = 'GPT-4 (OpenAI)',
  LLAMA = 'Llama 3 (Meta)',
  ANTHROPIC = 'Claude 3 (Anthropic)'
}

export enum SafetyLevel {
  STRICT = 'Strict (Financial/Health)',
  MODERATE = 'Moderate (Internal)',
  LAX = 'Lax (Dev/Test)'
}

// --- SaaS / Multi-Tenancy Types ---

export type UserRole = 'owner' | 'admin' | 'analyst';
export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string; // unique identifier for tenant
  tier: PlanTier;
  createdAt: number;
}

export interface Subscription {
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: number;
  paymentMethodLast4?: string;
  planName: string;
}

export interface TeamMember extends User {
  status: 'active' | 'invited';
  lastLogin?: number;
}

// --- Admin Dashboard Types ---

export interface PlanConfig {
  id: string;
  tierId: PlanTier;
  name: string;
  price: number;
  currency: string;
  limits: {
    tokens: number | 'Unlimited';
    users: number | 'Unlimited';
    storageGB: number;
  };
  features: {
    standardSupport: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customIntegrations: boolean;
    sso: boolean;
  };
  isActive: boolean;
}

export interface GlobalUser extends User {
  organizationName: string;
  status: 'active' | 'suspended';
  createdAt: number;
}

export interface AdminAction {
  id: string;
  adminId: string;
  actionType: 'UPDATE_PLAN' | 'SUSPEND_USER' | 'ACTIVATE_USER' | 'CHANGE_ROLE' | 'DELETE_USER';
  targetId: string;
  details: string;
  timestamp: number;
}

// --- Financial & Payout Types ---

export interface BankAccount {
  id: string;
  tenantId: string; // Data Isolation
  bankName: string;
  last4: string;
  routingNumber?: string; // Encrypted
  accountNumber?: string; // Encrypted
  accountHolderName: string;
  type: 'checking' | 'savings';
  country: string;
  currency: string;
  isDefault: boolean;
  status: 'verified' | 'pending' | 'failed';
}

export type PaymentGatewayType = 'stripe' | 'paypal' | 'wise' | 'square' | '2checkout' | 'bank_transfer';

export interface PaymentGatewayConfig {
  id: string;
  tenantId: string;
  type: PaymentGatewayType;
  name: string;
  isEnabled: boolean;
  isDefault: boolean;
  credentials: {
    apiKey?: string; // Encrypted
    secretKey?: string; // Encrypted
    merchantId?: string;
    clientId?: string;
    // Bank Transfer Specific Fields
    bankName?: string;
    accountNumber?: string; // Encrypted
    routingNumber?: string; // Encrypted
    accountHolderName?: string;
    swiftCode?: string;
  };
}

export interface PayoutSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  threshold: number;
  anchorDay?: number;
}

export interface Transaction {
  id: string;
  tenantId: string;
  date: number;
  type: 'subscription' | 'usage_fee' | 'refund';
  customerName: string;
  amount: number;
  fee: number;
  net: number;
  status: 'succeeded' | 'pending' | 'failed';
  invoiceId?: string;
}

export interface PayoutRecord {
  id: string;
  tenantId: string;
  date: number;
  amount: number;
  destinationBank: string;
  status: 'paid' | 'in_transit' | 'failed';
  arrivalDate: number;
  referenceId: string;
}

export interface RevenueStats {
  totalRevenueMonth: number;
  availablePayout: number;
  pendingBalance: number;
  totalRevenueAllTime: number;
  revenueHistory: { date: string; amount: number }[];
  revenueByPlan: { name: string; value: number }[];
}

export interface TaxConfig {
  taxId: string;
  taxIdType: 'EIN' | 'SSN' | 'VAT' | 'GST';
  country: string;
  withholdingRate: number;
  filingStatus: 'individual' | 'corporation' | 'llc';
}

// --- Core App Types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'tool';
  content: string;
  timestamp: number;
  cost?: number;
  tokens?: number;
  provider?: string;
  signature?: string;
  flagged?: boolean;
  redacted?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  user: string;
  details: string;
  hash: string;
  status: 'success' | 'violation' | 'error';
}

export type RuleType = 'PII' | 'CONTENT' | 'BUDGET' | 'RBAC' | 'JAILBREAK' | 'COMPLIANCE' | 'GEO' | 'TIME';

export interface PolicyRule {
  id: string;
  type: RuleType;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  config: Record<string, any>;
}

export interface PolicyConfig {
  piiRedaction: boolean;
  jailbreakDetection: boolean;
  topicConstraint: boolean;
  auditLogging: boolean;
  maxBudget: number;
  advancedRules?: PolicyRule[];
}

export interface MeteringStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  budgetRemaining: number;
}

// --- Settings & Infrastructure Types ---

export interface LLMProviderConfig {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'ollama' | 'anthropic' | 'custom';
  isCustom?: boolean;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  endpoint?: string;
  models: string[];
  selectedModel: string;
  priority: number;
  costPer1k?: number;
  lastTested?: number;          // Timestamp of last successful test
  testStatus?: 'passed' | 'failed' | 'pending';
}

export interface LLMConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  error?: string;
  timestamp?: number;
}

// Grid View Resource Type
export interface CloudResource {
  id: string;
  tenantId: string;
  name: string;
  provider: 'gcp' | 'aws' | 'azure' | 'onprem';
  region: string;
  status: 'active' | 'inactive' | 'maintenance';
  credentials: {
    accessKeyId?: string; // Encrypted
    secretAccessKey?: string; // Encrypted
    serviceAccountJson?: string; // Encrypted
    connectionString?: string; // Encrypted
  };
  config: {
    storageBucket?: string;
    instanceType?: string;
    vpcId?: string;
  };
  createdAt: number;
}

export type DataSourceType = 'database' | 'storage' | 'api' | 'file';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  connectionString: string;
  credentials?: {
    username?: string;
    password?: string;
    accessKey?: string;
  };
  syncInterval: 'realtime' | '5min' | '1hour' | 'daily';
  lastSync?: string;
  status: 'active' | 'error' | 'syncing' | 'testing';
}

export interface SecurityConfig {
  adminIps: string[];
  rateLimitRequests: number;
  keyRotationDays: number;
  enforceEncryptionAtRest: boolean;
  requireMfaForAdmin: boolean;
}

export interface SettingsConfig {
  providers: LLMProviderConfig[];
  cloudResources: CloudResource[]; // Changed from single cloud object to array
  dataSources: DataSourceConfig[];
  security: SecurityConfig;
}
