import React, { useState } from 'react';
import { Lock, Shield, AlertOctagon, Save, Sliders, LayoutGrid } from 'lucide-react';
import { PolicyConfig, SafetyLevel } from '../types';
import { SAFETY_PRESETS } from '../constants';
import { AdvancedPolicyBuilder } from './AdvancedPolicyBuilder';

interface PoliciesProps {
  config: PolicyConfig;
  setConfig: (config: PolicyConfig) => void;
}

export const Policies: React.FC<PoliciesProps> = ({ config, setConfig }) => {
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');

  const togglePolicy = (key: keyof PolicyConfig) => {
    setConfig({ ...config, [key]: !config[key as any] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Policy Engine</h1>
          <p className="text-slate-400">Configure guardrails, PII detection, and compliance enforcement.</p>
        </div>
        
        {/* View Switcher */}
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
          <button
            onClick={() => setViewMode('simple')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'simple' 
                ? 'bg-slate-800 text-emerald-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sliders size={16} />
            Standard View
          </button>
          <button
            onClick={() => setViewMode('advanced')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'advanced' 
                ? 'bg-slate-800 text-emerald-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutGrid size={16} />
            Advanced Builder
          </button>
        </div>
      </div>

      {viewMode === 'advanced' ? (
        <AdvancedPolicyBuilder config={config} setConfig={setConfig} />
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Shield className="w-5 h-5 text-emerald-500" />
                 Global Safety Preset
               </h3>
               <div className="flex gap-2">
                 {Object.keys(SAFETY_PRESETS).map((level) => (
                   <button
                    key={level}
                    onClick={() => setConfig({ ...config, ...SAFETY_PRESETS[level as SafetyLevel] })}
                    className="px-3 py-1 text-xs border border-slate-700 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
                   >
                     {level}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
              {/* PII Redaction */}
              <div className="flex items-start justify-between p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${config.piiRedaction ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                    <Lock className={`w-6 h-6 ${config.piiRedaction ? 'text-emerald-500' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-slate-200">PII Auto-Redaction</h4>
                    <p className="text-sm text-slate-500 mt-1">Automatically detect and redact emails, phone numbers, and SSNs before they leave the secure boundary.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.piiRedaction} onChange={() => togglePolicy('piiRedaction')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Jailbreak Detection */}
              <div className="flex items-start justify-between p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${config.jailbreakDetection ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                    <AlertOctagon className={`w-6 h-6 ${config.jailbreakDetection ? 'text-emerald-500' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-slate-200">Adversarial Defense</h4>
                    <p className="text-sm text-slate-500 mt-1">Block prompts attempting to bypass safety filters (DAN, prompt injection).</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.jailbreakDetection} onChange={() => togglePolicy('jailbreakDetection')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Budget */}
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="mb-4">
                  <h4 className="text-base font-medium text-slate-200">Monthly Budget Cap</h4>
                  <p className="text-sm text-slate-500 mt-1">Hard limit for API spend across all providers.</p>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    value={config.maxBudget} 
                    onChange={(e) => setConfig({...config, maxBudget: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="px-4 py-2 bg-slate-800 rounded-lg text-emerald-400 font-mono font-bold min-w-[100px] text-center">
                    ${config.maxBudget}
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end">
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20">
                <Save className="w-4 h-4" />
                Save Policy Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};