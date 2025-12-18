
import React from 'react';
import { Book, Code, Terminal, FileText } from 'lucide-react';

export const Documentation = () => {
  return (
    <div className="pt-24 pb-24 flex min-h-screen">
      <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="hidden md:block col-span-3 border-r border-slate-800 pr-6">
           <div className="sticky top-24 space-y-8">
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Book className="w-4 h-4" /> Getting Started</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                   <li className="text-emerald-400 font-medium cursor-pointer">Introduction</li>
                   <li className="hover:text-white cursor-pointer">Installation</li>
                   <li className="hover:text-white cursor-pointer">Quick Start</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Terminal className="w-4 h-4" /> API Reference</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                   <li className="hover:text-white cursor-pointer">Authentication</li>
                   <li className="hover:text-white cursor-pointer">Chat Completions</li>
                   <li className="hover:text-white cursor-pointer">Audit Logs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Policy DSL</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                   <li className="hover:text-white cursor-pointer">JSON Schema</li>
                   <li className="hover:text-white cursor-pointer">Rule Types</li>
                </ul>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9 pl-0 md:pl-6">
           <div className="prose prose-invert max-w-none">
              <h1 className="text-4xl font-bold text-white mb-6">Introduction</h1>
              <p className="text-lg text-slate-400 mb-8">
                Agent-SAFE Grid is a middleware platform that sits between your application and LLM providers. 
                It handles security, compliance, and observability, allowing you to ship AI features faster without building custom guardrails.
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Quick Installation</h3>
                <div className="bg-black rounded-lg p-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                   npm install @agent-safe/sdk
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mt-12 mb-4">Basic Usage</h2>
              <p className="text-slate-400 mb-4">
                Initialize the client with your API key. The SDK automatically routes requests to your configured providers based on your dashboard settings.
              </p>
              
              <div className="bg-black rounded-lg p-6 border border-slate-800 font-mono text-sm text-slate-300 overflow-x-auto">
<pre>{`import { AgentSafe } from '@agent-safe/sdk';

const client = new AgentSafe({
  apiKey: process.env.AGENT_SAFE_KEY,
});

async function main() {
  const response = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello world' }],
    config: {
      policy: 'strict-financial' // Use a preset policy
    }
  });

  console.log(response.choices[0].message);
}`}</pre>
              </div>

              <h2 className="text-2xl font-bold text-white mt-12 mb-4">Safety Response Headers</h2>
              <p className="text-slate-400 mb-4">
                Every response includes security headers indicating if content was redacted or modified.
              </p>
              <table className="w-full text-left text-sm text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2">Header</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 font-mono text-emerald-400">X-Safe-Redacted</td>
                    <td className="py-2">Boolean indicating if PII was removed.</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-2 font-mono text-emerald-400">X-Safe-Audit-Id</td>
                    <td className="py-2">Unique ID for the audit log entry.</td>
                  </tr>
                </tbody>
              </table>

           </div>
        </div>
      </div>
    </div>
  );
};
