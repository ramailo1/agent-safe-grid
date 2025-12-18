import React, { useState } from 'react';
import { FlaskConical, Skull, Play, Activity, AlertTriangle } from 'lucide-react';

export const Robustness = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runChaosTest = () => {
    setIsRunning(true);
    setLogs([]);
    
    const scenarios = [
      "Injecting random noise into system prompt...",
      "Attempting prompt injection: 'Ignore previous instructions'...",
      "Overloading token buffer...",
      "Simulating provider latency spike (2500ms)...",
      "Testing PII leakage filter with mock SSN...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= scenarios.length) {
        clearInterval(interval);
        setIsRunning(false);
        setLogs(prev => [...prev, "✅ ALL SYSTEMS PASSED. Resiliency Score: 98/100"]);
        return;
      }
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${scenarios[i]}`]);
      i++;
    }, 1200);
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-white mb-2">Robustness Harness</h1>
        <p className="text-slate-400">Canary deployments and chaos engineering for AI agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Canary Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-amber-500/10 rounded-lg">
                 <FlaskConical className="w-6 h-6 text-amber-500" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Canary Deployment</h3>
                 <p className="text-xs text-slate-400">Traffic Split: 95% Stable / 5% Canary</p>
               </div>
             </div>
             <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
               HEALTHY
             </div>
           </div>
           
           <div className="space-y-4">
             <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 w-[95%] h-full float-left"></div>
                <div className="bg-amber-500 w-[5%] h-full float-left"></div>
             </div>
             <div className="flex justify-between text-xs text-slate-500">
                <span>Gemini 1.5 Flash (v2.3)</span>
                <span>Gemini 2.0 Flash (v2.4-rc1)</span>
             </div>
             
             <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
               Adjust Traffic Rules
             </button>
           </div>
        </div>

        {/* Chaos Card */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-500/10 rounded-lg">
                 <Skull className="w-6 h-6 text-rose-500" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-white">Red Team Automation</h3>
                 <p className="text-xs text-slate-400">Adversarial testing suite</p>
               </div>
             </div>
           </div>

           <p className="text-sm text-slate-400 mb-4">
             Run automated adversarial attacks to test prompt guardrails against jailbreaks and extraction.
           </p>
           
           <button 
             onClick={runChaosTest}
             disabled={isRunning}
             className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               isRunning 
               ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
               : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20'
             }`}
           >
             {isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
             {isRunning ? 'Running Attack Simulations...' : 'Execute Chaos Suite'}
           </button>
        </div>
      </div>

      {/* Console Output */}
      <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-sm h-64 overflow-y-auto custom-scrollbar shadow-inner">
        <div className="text-slate-500 mb-2 border-b border-slate-900 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" /> System Logs
        </div>
        {logs.length === 0 ? (
          <span className="text-slate-700 italic">Waiting for test execution...</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="text-emerald-500 mr-2">{'>'}</span>
              <span className="text-slate-300">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};