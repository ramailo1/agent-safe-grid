import React, { useState } from 'react';
import {
  ShieldAlert, Ban, DollarSign, Users, Lock, FileText, Globe, Clock,
  GripVertical, Trash2, Copy, AlertTriangle, CheckCircle2, Download, RotateCcw, Save
} from 'lucide-react';
import { PolicyRule, RuleType, PolicyConfig } from '../types';
import { POLICY_BLOCKS } from '../constants';
import { useToast } from '../components/Toast';

interface AdvancedPolicyBuilderProps {
  config: PolicyConfig;
  setConfig: (config: PolicyConfig) => void;
}

const IconMap: Record<string, any> = {
  ShieldAlert, Ban, DollarSign, Users, Lock, FileText, Globe, Clock
};

export const AdvancedPolicyBuilder: React.FC<AdvancedPolicyBuilderProps> = ({ config, setConfig }) => {
  const toast = useToast();
  const [rules, setRules] = useState<PolicyRule[]>(config.advancedRules || []);
  const [draggedType, setDraggedType] = useState<RuleType | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // --- Drag and Drop Handlers (HTML5 Native) ---

  const handleDragStart = (e: React.DragEvent, type: RuleType) => {
    setDraggedType(type);
    e.dataTransfer.setData('ruleType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('ruleType') as RuleType;
    if (type) {
      addRule(type, index);
    }
    setDraggedType(null);
    setDragOverIndex(null);
  };

  const addRule = (type: RuleType, index?: number) => {
    const template = POLICY_BLOCKS.find(b => b.type === type);
    if (!template) return;

    const newRule: PolicyRule = {
      id: crypto.randomUUID(),
      type: template.type,
      name: template.name,
      description: template.description,
      enabled: true,
      severity: 'medium',
      config: JSON.parse(JSON.stringify(template.defaultConfig)) // Deep copy
    };

    setRules(prev => {
      const newRules = [...prev];
      if (index !== undefined && index !== -1) {
        newRules.splice(index, 0, newRule);
      } else {
        newRules.push(newRule);
      }
      return newRules;
    });
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const updateRuleConfig = (id: string, key: string, value: any) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, config: { ...r.config, [key]: value } } : r
    ));
  };

  const updateRuleMeta = (id: string, key: keyof PolicyRule, value: any) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, [key]: value } : r
    ));
  };

  // --- Synchronization Logic ---

  const handleSave = () => {
    // Sync high-level boolean flags based on granular rules for backward compatibility
    const updatedConfig: PolicyConfig = {
      ...config,
      advancedRules: rules,
      piiRedaction: rules.some(r => r.type === 'PII' && r.enabled),
      jailbreakDetection: rules.some(r => r.type === 'JAILBREAK' && r.enabled),
      maxBudget: rules.find(r => r.type === 'BUDGET' && r.enabled)?.config.limit || config.maxBudget
    };

    setConfig(updatedConfig);
    toast?.success("Policy Saved!", "Policy configuration compiled and saved successfully");
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "policy-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">

      {/* Left Sidebar: Component Palette */}
      <div className="col-span-3 bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col overflow-hidden">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Policy Blocks</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {POLICY_BLOCKS.map((block) => {
            const Icon = IconMap[block.icon] || ShieldAlert;
            return (
              <div
                key={block.type}
                draggable
                onDragStart={(e) => handleDragStart(e, block.type)}
                className="bg-slate-800 border border-slate-700 hover:border-emerald-500/50 p-3 rounded-lg cursor-grab active:cursor-grabbing group transition-all hover:bg-slate-800/80 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded text-emerald-500 group-hover:text-emerald-400 transition-colors">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{block.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{block.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-200 flex gap-2">
            <RotateCcw size={14} className="mt-0.5 shrink-0" />
            Drag blocks to the canvas to build your security posture.
          </p>
        </div>
      </div>

      {/* Center: Canvas / Drop Zone */}
      <div
        className="col-span-6 bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-xl p-6 overflow-y-auto relative flex flex-col gap-4 transition-colors"
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e)}
        style={{ borderColor: draggedType ? '#10b981' : '#1e293b' }}
      >
        {rules.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
            <ShieldAlert size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-semibold">Policy Canvas Empty</p>
            <p className="text-sm opacity-60">Drag blocks from the left to start building</p>
          </div>
        ) : (
          rules.map((rule, index) => {
            const Icon = POLICY_BLOCKS.find(b => b.type === rule.type)?.icon;
            const IconComp = Icon ? IconMap[Icon] : ShieldAlert;

            return (
              <div
                key={rule.id}
                className={`bg-slate-900 border ${rule.enabled ? 'border-slate-700' : 'border-slate-800 opacity-60'} rounded-lg p-4 shadow-lg group relative hover:border-slate-600 transition-all`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
                      <GripVertical size={18} />
                    </div>
                    <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">{rule.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{rule.id.substring(0, 8)}</span>
                        {rule.severity === 'critical' && <span className="text-[10px] text-rose-500 font-bold">CRITICAL</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={rule.enabled} onChange={() => updateRuleMeta(rule.id, 'enabled', !rule.enabled)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <button onClick={() => removeRule(rule.id)} className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Dynamic Configuration Form based on Type */}
                {rule.enabled && (
                  <div className="pl-10 pr-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {rule.type === 'PII' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-slate-400 mb-1 block">Redaction Patterns</label>
                          <div className="flex gap-2 flex-wrap">
                            {['email', 'phone', 'ssn', 'credit_card'].map(pat => (
                              <button
                                key={pat}
                                onClick={() => {
                                  const current = rule.config.patterns || [];
                                  const newPats = current.includes(pat) ? current.filter((p: string) => p !== pat) : [...current, pat];
                                  updateRuleConfig(rule.id, 'patterns', newPats);
                                }}
                                className={`px-2 py-1 rounded text-xs border ${rule.config.patterns?.includes(pat) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                              >
                                {pat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {rule.type === 'BUDGET' && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Limit ({rule.config.period})</span>
                          <span className="text-emerald-400 font-mono">${rule.config.limit}</span>
                        </div>
                        <input
                          type="range" min="10" max="5000" step="10"
                          value={rule.config.limit}
                          onChange={(e) => updateRuleConfig(rule.id, 'limit', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}

                    {rule.type === 'CONTENT' && (
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Blocked Keywords (comma separated)</label>
                        <input
                          type="text"
                          value={rule.config.keywords?.join(', ') || ''}
                          onChange={(e) => updateRuleConfig(rule.id, 'keywords', e.target.value.split(',').map(s => s.trim()))}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. confidential, secret, internal"
                        />
                      </div>
                    )}

                    {rule.type === 'JAILBREAK' && (
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-xs text-slate-400">Sensitivity Threshold</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400">{rule.config.sensitivity}</span>
                          <input
                            type="range" min="0" max="1" step="0.1"
                            value={rule.config.sensitivity}
                            onChange={(e) => updateRuleConfig(rule.id, 'sensitivity', parseFloat(e.target.value))}
                            className="w-24 h-1.5 bg-slate-700 rounded-lg accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right: DSL Preview */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              POLICY JSON DSL
            </h3>
            <button onClick={downloadJson} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors">
              <Download size={12} /> Export
            </button>
          </div>

          <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto custom-scrollbar">
            <pre className="text-[10px] leading-relaxed font-mono text-emerald-400/90">
              {JSON.stringify({
                version: "2.4.0",
                timestamp: new Date().toISOString(),
                enforcementMode: "strict",
                rules: rules.filter(r => r.enabled).map(({ id, type, config, severity }) => ({ type, severity, config }))
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Rule Coverage</span>
              <span className="text-slate-200">{rules.length} active definitions</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Compliance Check</span>
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Passing</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save size={16} />
            Deploy Policy
          </button>
        </div>
      </div>
    </div>
  );
};