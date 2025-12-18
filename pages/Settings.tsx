
import React, { useState } from 'react';
import {
   Lock, Server, Cloud, Database, ShieldCheck,
   CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Save,
   Plus, Trash2, Activity, Zap, X, HardDrive, Globe, Key, Edit2, Power, Loader2
} from 'lucide-react';
import { SettingsConfig, LLMProviderConfig, DataSourceConfig, DataSourceType, CloudResource, SecurityConfig, LLMConnectionTestResult } from '../types';
import { AuthSession } from '../services/authService';
import { useToast } from '../components/Toast';
import { testLLMConnection } from '../services/llmService';

interface SettingsProps {
   config: SettingsConfig;
   setConfig: (config: SettingsConfig) => void;
   session: AuthSession;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig, session }) => {
   const [activeTab, setActiveTab] = useState<'providers' | 'cloud' | 'data' | 'security'>('providers');
   const toast = useToast();

   // Tenant ID for isolation
   const tenantId = session.organization.id;

   // Filtered Data (Simulating Tenant Isolation on Frontend - Backend would force this)
   // In a real app, 'config' would only contain the tenant's data.
   // Since we are using a shared mock state object in App.tsx, we filter here for the demo.
   const tenantProviders = config.providers || []; // Ensure array
   const tenantCloud = config.cloudResources ? config.cloudResources.filter(r => r.tenantId === tenantId) : [];

   // Access Control
   const canEdit = session.user.role === 'owner' || session.user.role === 'admin';
   const isOwner = session.user.role === 'owner'; // Only owners can add/edit/delete providers

   // Modal States
   const [modalOpen, setModalOpen] = useState(false);
   const [modalType, setModalType] = useState<'provider' | 'datasource' | 'cloud'>('provider');

   // Form States
   const [newProvider, setNewProvider] = useState<Partial<LLMProviderConfig>>({
      name: '', apiKey: '', baseUrl: '', models: ['custom-v1'], provider: 'custom', enabled: true
   });

   // Connection Test States
   const [testing, setTesting] = useState(false);
   const [testResult, setTestResult] = useState<LLMConnectionTestResult | null>(null);
   const [newCloud, setNewCloud] = useState<Partial<CloudResource>>({ provider: 'aws', region: 'us-east-1', status: 'active' });
   const [newDataSource, setNewDataSource] = useState<Partial<DataSourceConfig>>({
      name: '', type: 'database', connectionString: '', syncInterval: 'realtime'
   });

   // --- Handlers ---

   const handleAddCloud = () => {
      if (!newCloud.name || !newCloud.credentials?.accessKeyId) {
         toast?.error("Validation Error", "Name and Access Key are required");
         return;
      }
      const resource: CloudResource = {
         id: `cr_${Date.now()}`,
         tenantId,
         name: newCloud.name,
         provider: newCloud.provider || 'aws',
         region: newCloud.region || 'us-east-1',
         status: 'active',
         credentials: newCloud.credentials, // Encrypt in service
         config: {},
         createdAt: Date.now()
      };
      setConfig({ ...config, cloudResources: [...(config.cloudResources || []), resource] });
      setModalOpen(false);
      setNewCloud({ provider: 'aws', region: 'us-east-1', status: 'active' });
   };

   const deleteCloudResource = (id: string) => {
      setConfig({ ...config, cloudResources: (config.cloudResources || []).filter(r => r.id !== id) });
   };

   // Test LLM Connection
   const handleTestConnection = async () => {
      setTesting(true);
      // If a connection test was performed, ensure it succeeded
      if (testResult) {
         if (!testResult.success) {
            toast?.error('Connection Test Failed', testResult.error || 'Unable to connect');
            return;
         }
      }
      setTestResult(null);

      try {
         const result = await testLLMConnection(newProvider);
         setTestResult(result);

         if (result.success) {
            toast?.success('Connection Test', `✓ Successfully connected (${result.latency}ms)`);
         } else {
            toast?.error('Connection Test Failed', result.error || 'Unknown error');
         }
      } catch (error: any) {
         console.error('Connection test error:', error);
         setTestResult({
            success: false,
            message: 'Test failed',
            error: error.message || 'Network error',
            timestamp: Date.now()
         });
         toast?.error('Connection Test Failed', error.message || 'Network error');
      } finally {
         setTesting(false);
      }
   };

   const handleAddProvider = async () => {
      // Validation
      if (!newProvider.name?.trim()) {
         toast?.error("Validation Error", "Provider name is required");
         return;
      }
      if (newProvider.name.length < 2) {
         toast?.error("Validation Error", "Provider name must be at least 2 characters");
         return;
      }
      if (!newProvider.provider) {
         toast?.error("Validation Error", "Provider type is required");
         return;
      }
      if (newProvider.apiKey && newProvider.apiKey.length < 10) {
         toast?.error("Validation Error", "API key seems too short (minimum 10 characters)");
         return;
      }
      if (newProvider.baseUrl && !newProvider.baseUrl.startsWith('http')) {
         toast?.error("Validation Error", "Base URL must start with http:// or https://");
         return;
      }

      try {
         if (newProvider.id) {
            // Editing existing provider
            const updated = config.providers.map(p =>
               p.id === newProvider.id ? { ...p, ...newProvider } : p
            );
            setConfig({ ...config, providers: updated });
            toast?.success("Success!", "LLM provider updated successfully");
         } else {
            // Adding new provider
            const provider: LLMProviderConfig = {
               id: `custom-${Date.now()}`,
               name: newProvider.name!,
               provider: newProvider.provider as any || 'custom',
               isCustom: true,
               enabled: newProvider.enabled !== false,
               apiKey: newProvider.apiKey,
               baseUrl: newProvider.baseUrl,
               endpoint: newProvider.endpoint,
               models: newProvider.models || [],
               selectedModel: newProvider.selectedModel || (newProvider.models && newProvider.models[0]) || 'default',
               priority: newProvider.priority || 99
            };
            setConfig({ ...config, providers: [...config.providers, provider] });
            toast?.success("Success!", "LLM provider added successfully");
         }
         setModalOpen(false);
         setNewProvider({
            name: '', apiKey: '', baseUrl: '', models: ['custom-v1'], provider: 'custom', enabled: true
         });
      } catch (e: any) {
         console.error('Error saving provider:', e);
         toast?.error("Save Failed", e.message || 'Unknown error occurred');
      }
   };

   const handleAddDataSource = () => {
      // Existing data source logic...
      const ds: DataSourceConfig = {
         id: `ds-${Date.now()}`,
         name: newDataSource.name!,
         type: newDataSource.type as DataSourceType,
         connectionString: newDataSource.connectionString!,
         syncInterval: newDataSource.syncInterval as any,
         status: 'active'
      };
      setConfig({ ...config, dataSources: [...config.dataSources, ds] });
      setModalOpen(false);
   };

   const updateSecurity = (key: keyof SecurityConfig, value: any) => {
      setConfig({ ...config, security: { ...config.security, [key]: value } });
   };

   // --- Sub-Components ---

   const CloudCard = ({ resource }: { resource: CloudResource }) => (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative group hover:border-blue-500/50 transition-all">
         <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                  <Cloud className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">{resource.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                     <span className="uppercase">{resource.provider}</span>
                     <span>•</span>
                     <Globe className="w-3 h-3" /> {resource.region}
                  </div>
               </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs border ${resource.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
               {resource.status.toUpperCase()}
            </div>
         </div>

         <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <Key className="w-4 h-4" />
               <span className="font-mono">Key ID: ••••••••{resource.credentials.accessKeyId?.slice(-4)}</span>
            </div>
         </div>

         <div className="flex gap-2">
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
               <Edit2 className="w-4 h-4" /> Configure
            </button>
            <button onClick={() => deleteCloudResource(resource.id)} className="px-3 bg-slate-800 hover:bg-rose-900/20 hover:text-rose-500 text-slate-400 rounded-lg transition-colors">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>
   );

   // Only Owners/Admins can access settings
   if (!canEdit) {
      return <div className="p-10 text-center text-rose-500">Access Restricted</div>;
   }

   return (
      <div className="space-y-8 pb-10 relative">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
               <p className="text-slate-400">Manage providers, infrastructure connections, and security protocols.</p>
            </div>
            <button
               onClick={() => {/* Save Logic */ }}
               className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
            >
               <Save className="w-4 h-4" /> Save Changes
            </button>
         </div>

         {/* Tab Navigation */}
         <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
            {[
               { id: 'providers', label: 'LLM Providers', icon: Server },
               { id: 'cloud', label: 'Cloud Infrastructure', icon: Cloud },
               { id: 'data', label: 'Data Sources', icon: Database },
               { id: 'security', label: 'Security & Access', icon: ShieldCheck },
            ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                     ? 'border-emerald-500 text-emerald-400'
                     : 'border-transparent text-slate-400 hover:text-slate-200'
                     }`}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
            ))}
         </div>

         <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* --- PROVIDERS TAB --- */}
            {activeTab === 'providers' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {tenantProviders.map((p, idx) => (
                        <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-all group">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="p-3 bg-emerald-900/20 rounded-lg text-emerald-400">
                                    <Server className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h3 className="text-white font-bold">{p.name}</h3>
                                    <p className="text-slate-500 text-sm capitalize">{p.provider}</p>
                                 </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs border ${p.enabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                 {p.enabled ? 'ACTIVE' : 'INACTIVE'}
                              </div>
                           </div>

                           <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <Key className="w-4 h-4" />
                                 <span className="font-mono">API Key: {p.apiKey ? '••••••••' + p.apiKey.slice(-4) : 'Not configured'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <Activity className="w-4 h-4" />
                                 <span>Model: {p.selectedModel || p.models[0]}</span>
                              </div>
                              {p.priority && (
                                 <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Zap className="w-4 h-4" />
                                    <span>Priority: {p.priority}</span>
                                 </div>
                              )}
                           </div>

                           <div className="flex gap-2">
                              {/* Edit (Owner only) */}
                              {isOwner && (
                                 <button
                                    onClick={() => {
                                       setNewProvider(p);
                                       setModalType('provider');
                                       setModalOpen(true);
                                    }}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                 >
                                    <Edit2 className="w-4 h-4" /> Edit
                                 </button>
                              )}

                              {/* Enable/Disable Toggle (All users) */}
                              <button
                                 onClick={() => {
                                    const updated = config.providers.map(provider =>
                                       provider.id === p.id ? { ...provider, enabled: !provider.enabled } : provider
                                    );
                                    setConfig({ ...config, providers: updated });
                                 }}
                                 className={`${isOwner ? 'px-3' : 'flex-1'} bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors py-2 flex items-center justify-center gap-2`}
                              >
                                 <Power className="w-4 h-4" />
                                 {!isOwner && <span className="text-sm">{p.enabled ? 'Disable' : 'Enable'}</span>}
                              </button>

                              {/* Delete (Owner only, Custom providers only) */}
                              {isOwner && p.isCustom && (
                                 <button
                                    onClick={() => {
                                       if (confirm(`Delete ${p.name}?`)) {
                                          setConfig({ ...config, providers: config.providers.filter(pr => pr.id !== p.id) });
                                       }
                                    }}
                                    className="px-3 bg-slate-800 hover:bg-rose-900/20 hover:text-rose-500 text-slate-400 rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              )}
                           </div>
                        </div>
                     ))}

                     {/* Add Custom Provider (Owner only) */}
                     {isOwner && (
                        <button
                           onClick={() => {
                              setNewProvider({
                                 name: '', apiKey: '', baseUrl: '', models: ['custom-v1'], provider: 'custom', enabled: true
                              });
                              setTestResult(null);
                              setModalType('provider');
                              setModalOpen(true);
                           }}
                           className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-emerald-400 hover:border-emerald-500/50 transition-all min-h-[200px] group"
                        >
                           <div className="p-4 rounded-full bg-slate-900 group-hover:bg-emerald-500/10 mb-3 transition-colors">
                              <Plus className="w-8 h-8" />
                           </div>
                           <span className="font-medium">Add Custom Provider</span>
                           <p className="text-xs text-slate-500 mt-2 text-center">Configure OpenAI, Anthropic, or custom endpoints</p>
                        </button>
                     )}
                  </div>
               </div>
            )}

            {/* --- CLOUD TAB (Refactored to Grid) --- */}
            {activeTab === 'cloud' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h3 className="text-lg font-bold text-white">Connected Infrastructure</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {tenantCloud.map(resource => (
                        <CloudCard key={resource.id} resource={resource} />
                     ))}

                     <button
                        onClick={() => { setModalType('cloud'); setModalOpen(true); }}
                        className="border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-blue-400 hover:border-blue-500/50 transition-all min-h-[200px] group"
                     >
                        <div className="p-4 rounded-full bg-slate-900 group-hover:bg-blue-500/10 mb-3 transition-colors">
                           <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Add New Infrastructure</span>
                        <p className="text-xs text-slate-500 mt-2 text-center">Connect AWS, GCP, or Azure resources</p>
                     </button>
                  </div>
               </div>
            )}

            {/* --- DATA SOURCES TAB --- */}
            {activeTab === 'data' && (
               <div className="space-y-4">
                  <div className="flex justify-end">
                     <button
                        onClick={() => { setModalType('datasource'); setModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                     >
                        <Plus className="w-4 h-4" /> Add Source
                     </button>
                  </div>
                  {config.dataSources.map((ds) => (
                     <div key={ds.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                              <Database className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-white font-medium">{ds.name}</h4>
                              <div className="text-xs text-slate-500 font-mono mt-1">{ds.connectionString}</div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
               <div className="max-w-4xl">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-sm space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-300">API Rate Limit (req/min)</label>
                           <input
                              type="number"
                              value={config.security.rateLimitRequests}
                              onChange={(e) => updateSecurity('rateLimitRequests', parseInt(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Unified Modal */}
         {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                     <h3 className="text-xl font-bold text-white">
                        {modalType === 'provider' ? 'Add Provider' : modalType === 'cloud' ? 'Add Infrastructure' : 'Add Data Source'}
                     </h3>
                     <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     {/* Cloud Form */}
                     {modalType === 'cloud' && (
                        <>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Resource Name</label>
                              <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newCloud.name || ''} onChange={e => setNewCloud({ ...newCloud, name: e.target.value })} placeholder="Production AWS" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Provider</label>
                              <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white capitalize" value={newCloud.provider} onChange={e => setNewCloud({ ...newCloud, provider: e.target.value as any })}>
                                 <option value="aws">AWS</option>
                                 <option value="gcp">GCP</option>
                                 <option value="azure">Azure</option>
                                 <option value="onprem">On-Prem</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Region</label>
                              <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono" value={newCloud.region || ''} onChange={e => setNewCloud({ ...newCloud, region: e.target.value })} placeholder="us-east-1" />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Access Key ID</label>
                              <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono" value={newCloud.credentials?.accessKeyId || ''} onChange={e => setNewCloud({ ...newCloud, credentials: { ...newCloud.credentials, accessKeyId: e.target.value } })} />
                           </div>
                        </>
                     )}

                     {/* Provider Form (Complete) */}
                     {modalType === 'provider' && (
                        <>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Provider Name</label>
                              <input
                                 type="text"
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                 value={newProvider.name || ''}
                                 onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                                 placeholder="My Custom Provider"
                              />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Provider Type</label>
                              <select
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white capitalize"
                                 value={newProvider.provider || 'custom'}
                                 onChange={e => setNewProvider({ ...newProvider, provider: e.target.value as any })}
                              >
                                 <option value="google">Google (Gemini)</option>
                                 <option value="openai">OpenAI</option>
                                 <option value="anthropic">Anthropic (Claude)</option>
                                 <option value="ollama">Ollama (Local)</option>
                                 <option value="custom">Custom Endpoint</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                                 <Key className="w-3 h-3" /> API Key
                              </label>
                              <input
                                 type="password"
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                                 value={newProvider.apiKey || ''}
                                 onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                                 placeholder="sk-..."
                              />
                           </div>
                           {(newProvider.provider === 'custom' || newProvider.provider === 'ollama') && (
                              <div>
                                 <label className="text-xs text-slate-400 block mb-1">Base URL / Endpoint</label>
                                 <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                                    value={newProvider.baseUrl || newProvider.endpoint || ''}
                                    onChange={e => setNewProvider({ ...newProvider, baseUrl: e.target.value, endpoint: e.target.value })}
                                    placeholder="https://api.example.com/v1"
                                 />
                              </div>
                           )}
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Available Models (comma-separated)</label>
                              <input
                                 type="text"
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm"
                                 value={Array.isArray(newProvider.models) ? newProvider.models.join(', ') : ''}
                                 onChange={e => setNewProvider({ ...newProvider, models: e.target.value.split(',').map(m => m.trim()) })}
                                 placeholder="gpt-4, gpt-3.5-turbo"
                              />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 block mb-1">Default Model</label>
                              <input
                                 type="text"
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                                 value={newProvider.selectedModel || ''}
                                 onChange={e => setNewProvider({ ...newProvider, selectedModel: e.target.value })}
                                 placeholder="gpt-4"
                              />
                           </div>
                           <div className="flex items-center gap-2 pt-2">
                              <input
                                 type="checkbox"
                                 checked={newProvider.enabled || false}
                                 onChange={e => setNewProvider({ ...newProvider, enabled: e.target.checked })}
                                 className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-slate-300">Enable this provider</span>
                           </div>
                        </>
                     )}

                     {/* Data Source Form */}
                     {modalType === 'datasource' && (
                        <div>
                           <label className="text-xs text-slate-400 block mb-1">Source Name</label>
                           <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={newDataSource.name} onChange={e => setNewDataSource({ ...newDataSource, name: e.target.value })} />
                        </div>
                     )}

                     {/* Connection Test Result (Provider only) */}
                     {modalType === 'provider' && testResult && (
                        <div className={`p-4 rounded-lg border ${testResult.success
                           ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                           : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                           }`}>
                           <div className="flex items-start gap-3">
                              {testResult.success ? (
                                 <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              ) : (
                                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                 <p className="font-medium">{testResult.message}</p>
                                 {testResult.error && (
                                    <p className="text-sm mt-1 opacity-80">{testResult.error}</p>
                                 )}
                                 {testResult.latency && (
                                    <p className="text-xs mt-1 opacity-60">Response time: {testResult.latency}ms</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-6 border-t border-slate-800 flex justify-between gap-2">
                     {/* Test Connection (Provider only, left side) */}
                     {modalType === 'provider' && (
                        <button
                           onClick={handleTestConnection}
                           disabled={testing || !newProvider.provider}
                           className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded shadow-lg transition-colors flex items-center gap-2"
                        >
                           {testing ? (
                              <>
                                 <Loader2 className="w-4 h-4 animate-spin" />
                                 Testing...
                              </>
                           ) : (
                              <>
                                 <Activity className="w-4 h-4" />
                                 Test Connection
                              </>
                           )}
                        </button>
                     )}

                     {/* Cancel/Save (right side) */}
                     <div className="flex gap-2 ml-auto">
                        <button onClick={() => { setModalOpen(false); setTestResult(null); }} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                        <button
                           onClick={modalType === 'cloud' ? handleAddCloud : modalType === 'provider' ? handleAddProvider : handleAddDataSource}
                           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-lg"
                        >
                           Save
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
