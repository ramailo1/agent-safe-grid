
import { SafetyLevel, Provider, RuleType, SettingsConfig } from './types';

export const APP_NAME = "Agent-SAFE Grid";
export const APP_VERSION = "v2.4.0-enterprise";

export const DEFAULT_POLICY_CONFIG = {
  piiRedaction: true,
  jailbreakDetection: true,
  topicConstraint: false,
  auditLogging: true,
  maxBudget: 100.00,
  advancedRules: []
};

export const MOCK_PROVIDERS = [
  { id: Provider.GEMINI, name: 'Gemini 2.5 Flash', costPer1k: 0.0001, active: true },
  { id: Provider.OPENAI, name: 'GPT-4 Turbo', costPer1k: 0.01, active: false },
  { id: Provider.LLAMA, name: 'Llama 3 70B', costPer1k: 0.0005, active: false },
  { id: Provider.ANTHROPIC, name: 'Claude 3 Opus', costPer1k: 0.015, active: false },
];

export const SAFETY_PRESETS = {
  [SafetyLevel.STRICT]: { piiRedaction: true, jailbreakDetection: true, topicConstraint: true },
  [SafetyLevel.MODERATE]: { piiRedaction: true, jailbreakDetection: true, topicConstraint: false },
  [SafetyLevel.LAX]: { piiRedaction: false, jailbreakDetection: false, topicConstraint: false },
};

export const POLICY_BLOCKS: { type: RuleType; name: string; icon: string; description: string; defaultConfig: any }[] = [
  {
    type: 'PII',
    name: 'PII Redaction',
    icon: 'ShieldAlert',
    description: 'Detect & mask sensitive data (SSN, Email, Phone)',
    defaultConfig: { patterns: ['email', 'phone', 'ssn'], method: 'mask', scope: 'bi-directional' }
  },
  {
    type: 'CONTENT',
    name: 'Content Filter',
    icon: 'Ban',
    description: 'Block specific keywords or regex patterns',
    defaultConfig: { keywords: [], matchType: 'partial', action: 'block' }
  },
  {
    type: 'BUDGET',
    name: 'Budget Control',
    icon: 'DollarSign',
    description: 'Enforce spending limits per timeframe',
    defaultConfig: { limit: 100, period: 'monthly', alertThreshold: 80 }
  },
  {
    type: 'RBAC',
    name: 'Role Access',
    icon: 'Users',
    description: 'Define access levels for user roles',
    defaultConfig: { roles: ['admin'], permissions: ['read', 'write'] }
  },
  {
    type: 'JAILBREAK',
    name: 'Anti-Jailbreak',
    icon: 'Lock',
    description: 'Prevent prompt injection and attacks',
    defaultConfig: { sensitivity: 0.8, knownAttacks: true }
  },
  {
    type: 'COMPLIANCE',
    name: 'Compliance Pack',
    icon: 'FileText',
    description: 'Apply standard regulatory presets',
    defaultConfig: { standard: 'GDPR', dataRetentionDays: 30 }
  },
  {
    type: 'GEO',
    name: 'Geo-Fencing',
    icon: 'Globe',
    description: 'Restrict access by country/region',
    defaultConfig: { allowedCountries: ['US', 'EU', 'UK'] }
  },
  {
    type: 'TIME',
    name: 'Time Constraints',
    icon: 'Clock',
    description: 'Limit usage to specific business hours',
    defaultConfig: { startTime: '09:00', endTime: '17:00', timezone: 'UTC' }
  }
];

export const DEFAULT_SETTINGS: SettingsConfig = {
  providers: [
    {
      id: 'gemini-main',
      name: 'Gemini Production',
      provider: 'google',
      enabled: true,
      apiKey: 'sk-goog-********************',
      models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
      selectedModel: 'gemini-2.5-flash',
      priority: 1
    },
    {
      id: 'openai-backup',
      name: 'OpenAI Fallback',
      provider: 'openai',
      enabled: true,
      apiKey: 'sk-proj-********************',
      models: ['gpt-4-turbo', 'gpt-3.5-turbo'],
      selectedModel: 'gpt-4-turbo',
      priority: 2
    },
    {
      id: 'local-ollama',
      name: 'Local Privacy Net',
      provider: 'ollama',
      enabled: false,
      endpoint: 'http://localhost:11434',
      models: ['llama3', 'mistral', 'phi3'],
      selectedModel: 'llama3',
      priority: 3
    }
  ],
  cloudResources: [
    {
      id: 'res-default-1',
      tenantId: 'default',
      name: 'Production Cluster',
      provider: 'gcp',
      region: 'us-central1',
      status: 'active',
      credentials: {
        serviceAccountJson: 'svc-agent-grid-prod-8821'
      },
      config: {
        storageBucket: 'gs://agent-grid-logs',
        vpcId: 'vpc-prod-main'
      },
      createdAt: Date.now()
    }
  ],
  dataSources: [
    {
      id: 'ds-1',
      name: 'Customer DB (Postgres)',
      type: 'database',
      connectionString: 'postgresql://db.prod.internal:5432/customers',
      syncInterval: 'realtime',
      status: 'active'
    },
    {
      id: 'ds-2',
      name: 'Policy Documents (S3)',
      type: 'storage',
      connectionString: 's3://corp-policies-secure',
      syncInterval: '1hour',
      status: 'active'
    }
  ],
  security: {
    adminIps: ['10.0.0.0/24', '192.168.1.50'],
    rateLimitRequests: 1000,
    keyRotationDays: 90,
    enforceEncryptionAtRest: true,
    requireMfaForAdmin: true
  }
};
