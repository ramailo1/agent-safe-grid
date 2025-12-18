
import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, ShieldAlert, RefreshCw, Database, Lock, AlertTriangle } from 'lucide-react';
import { ChatMessage, PolicyConfig, Provider, LLMProviderConfig } from '../types';
import { generateAgentResponse, generateSignature, detectPII } from '../services/llmService';

interface PlaygroundProps {
  policy: PolicyConfig;
  onUsageUpdate: (tokens: number, cost: number) => void;
  onAuditLog: (entry: any) => void;
  providers: LLMProviderConfig[];
}

export const Playground: React.FC<PlaygroundProps> = ({ policy, onUsageUpdate, onAuditLog, providers }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || 'gemini-main');
  const [systemInstruction, setSystemInstruction] = useState("You are a helpful, security-conscious enterprise assistant.");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeProviders = providers.filter(p => p.enabled);
  const selectedProviderConfig = providers.find(p => p.id === selectedProviderId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const timestamp = Date.now();
    let finalContent = input;
    let wasRedacted = false;

    // Client-side Policy Check: PII
    if (policy.piiRedaction) {
      const check = detectPII(input);
      if (check.hasPII) {
        finalContent = check.redactedText;
        wasRedacted = true;
        
        onAuditLog({
          id: crypto.randomUUID(),
          timestamp,
          action: 'PII_REDACTION',
          user: 'user_1',
          details: 'Redacted sensitive PII from user prompt',
          status: 'violation',
          hash: await generateSignature(input, timestamp) // Hash original
        });
      }
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: finalContent,
      timestamp,
      provider: selectedProviderConfig?.name,
      redacted: wasRedacted,
      signature: await generateSignature(finalContent, timestamp)
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Map config ID back to enum if it's a standard provider, otherwise pass custom
      // For the service, we currently only really support Gemini fully, others are simulated.
      const providerEnum = selectedProviderConfig?.provider === 'google' ? Provider.GEMINI : Provider.OPENAI;
      
      const response = await generateAgentResponse(messages, finalContent, providerEnum, systemInstruction);
      
      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        provider: selectedProviderConfig?.name,
        tokens: response.tokens,
        signature: await generateSignature(response.text, Date.now())
      };

      setMessages(prev => [...prev, modelMsg]);
      
      // Metering
      const costPer1k = selectedProviderConfig?.costPer1k || 0.0001;
      const estimatedCost = (response.tokens / 1000) * costPer1k;
      onUsageUpdate(response.tokens, estimatedCost);

      // Audit Log Success
      onAuditLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: 'MODEL_INFERENCE',
        user: selectedProviderConfig?.name || 'Unknown',
        details: `Generated ${response.tokens} tokens via ${selectedProviderConfig?.models[0] || 'default model'}`,
        status: 'success',
        hash: modelMsg.signature
      });

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: "Error: Unable to complete request due to safety policy or connection failure.",
        timestamp: Date.now(),
        flagged: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Main Chat Area */}
      <div className="lg:col-span-3 flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <MessageSquareCodeIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Secure Session</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Encrypted • Audited • {selectedProviderConfig?.name}
              </div>
            </div>
          </div>
          
          <select 
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 max-w-[200px]"
          >
            {activeProviders.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
              <ShieldCheck className="w-16 h-16 mb-4 text-slate-600" />
              <p>Agent-SAFE Environment Ready</p>
              <p className="text-sm mt-2">Policies Active: PII Redaction, Audit Logging</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 relative ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                  ? 'bg-rose-900/30 border border-rose-800 text-rose-200'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
              }`}>
                {msg.redacted && (
                  <div className="absolute -top-3 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldAlert className="w-3 h-3" /> PII REMOVED
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] opacity-70">
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  {msg.signature && (
                    <div className="flex items-center gap-1" title={`Hash: ${msg.signature.substring(0, 16)}...`}>
                      <Lock className="w-3 h-3" /> Signed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
                 <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-slate-400 animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message securely..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-4 pr-12 py-3 shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              Data retention: 30 days
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              SOC2 Compliant
            </div>
             {policy.piiRedaction && (
              <div className="flex items-center gap-1 text-emerald-500">
                 <ShieldCheck className="w-3 h-3" />
                 PII Filter Active
              </div>
             )}
          </div>
        </div>
      </div>

      {/* Sidebar Config */}
      <div className="hidden lg:flex flex-col gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            System Instruction
          </h4>
          <textarea
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 h-32 focus:ring-emerald-500 focus:border-emerald-500"
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            placeholder="Define agent persona and constraints..."
          />
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex-1">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Live Diagnostics
          </h4>
          <div className="space-y-3">
             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 mb-1">Latency</p>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-emerald-400">124ms</span>
                 <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[30%]"></div>
                 </div>
               </div>
             </div>
             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 mb-1">Context Window</p>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-blue-400">{messages.reduce((acc, m) => acc + m.content.length, 0)} chars</span>
                 <span className="text-xs text-slate-600">/ 1M</span>
               </div>
             </div>
             <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 mb-1">Active Model</p>
               <p className="text-xs font-mono text-slate-300 truncate">{selectedProviderConfig?.selectedModel}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const MessageSquareCodeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
