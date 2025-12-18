
import React from 'react';
import { Shield, Zap, Network, Lock, Server, Code, CheckCircle2 } from 'lucide-react';

export const Features = () => {
  const sections = [
    {
      title: "Multi-LLM Orchestration",
      desc: "Seamlessly switch between Gemini, OpenAI, Anthropic, and open-source models like Llama 3 without changing your application code.",
      icon: Network,
      points: [
        "Unified API Adapter Layer",
        "Smart Routing based on latency/cost",
        "Automatic Fallback mechanisms",
        "Custom Local Model (Ollama) support"
      ]
    },
    {
      title: "Advanced Policy Engine",
      desc: "Enforce business rules, safety checks, and compliance requirements before the prompt ever reaches the model.",
      icon: Shield,
      points: [
        "PII Detection & Redaction (SSN, Credit Cards)",
        "Jailbreak/Injection Prevention",
        "Topic & Keyword Constraints",
        "Visual Policy Builder"
      ]
    },
    {
      title: "Cost & Budget Control",
      desc: "Prevent bill shock with granular metering and hard limits at the user, organization, or API key level.",
      icon: Zap,
      points: [
        "Real-time Token Counting",
        "Daily/Monthly Budget Caps",
        "Cost Attribution per User",
        "Alerts & Notifications"
      ]
    },
    {
      title: "Enterprise Security",
      desc: "Built for regulated industries requiring strict data isolation, encryption, and auditability.",
      icon: Lock,
      points: [
        "SOC2 Compliant Logging",
        "AES-256 Encryption at Rest",
        "Role-Based Access Control (RBAC)",
        "Tenant Data Isolation"
      ]
    }
  ];

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Platform Capabilities</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
             A complete toolkit for engineering teams to build, deploy, and manage AI agents with confidence.
          </p>
        </div>

        <div className="space-y-24">
          {sections.map((section, idx) => (
            <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
               <div className="flex-1 space-y-6">
                  <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
                    <section.icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  <p className="text-lg text-slate-400 leading-relaxed">{section.desc}</p>
                  <ul className="space-y-3 pt-4">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="flex-1 w-full">
                  <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 group-hover:opacity-75 transition-opacity"></div>
                     {/* Placeholder for Feature Graphic */}
                     <div className="text-slate-600 font-mono text-sm border border-slate-700 px-4 py-2 rounded bg-slate-950">
                        Graphic: {section.title}
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
