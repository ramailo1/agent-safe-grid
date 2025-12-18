import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Provider, LLMProviderConfig, LLMConnectionTestResult } from "../types";
import { api } from "./api";

// Initialize GenAI client lazily
// Note: We are using the new @google/genai SDK as requested.
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai && import.meta.env.VITE_API_KEY) {
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  }
  return ai;
};

/**
 * Simulate a cryptographic signature for audit trails
 */
export const generateSignature = async (content: string, timestamp: number): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(`${content}-${timestamp}-SECRET_KEY_SALT`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Simple regex-based PII detector for client-side safety simulation
 */
export const detectPII = (text: string): { hasPII: boolean; redactedText: string } => {
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

  let redactedText = text;
  let hasPII = false;

  if (emailRegex.test(text)) {
    hasPII = true;
    redactedText = redactedText.replace(emailRegex, '[EMAIL_REDACTED]');
  }
  if (phoneRegex.test(text)) {
    hasPII = true;
    redactedText = redactedText.replace(phoneRegex, '[PHONE_REDACTED]');
  }

  return { hasPII, redactedText };
};

/**
 * Unified Adapter interface for generating content
 * Currently wraps Gemini but architected to switch.
 */
export const generateAgentResponse = async (
  history: ChatMessage[],
  message: string,
  provider: Provider,
  systemInstruction?: string
): Promise<{ text: string; tokens: number }> => {

  // In a real app, this switch would route to different SDKs.
  // Here we only implement Gemini fully.
  if (provider !== Provider.GEMINI) {
    // Simulate latency for other providers
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      text: `[SIMULATION] Response from ${provider}. \n\n(Note: Only Gemini is fully active in this demo environment. Please switch to Gemini for live inference.)`,
      tokens: 25
    };
  }

  // Check if API key is configured
  const aiClient = getAI();
  if (!aiClient) {
    return {
      text: `⚠️ **API Key Not Configured**\n\nTo use the Gemini AI features, please:\n1. Go to **Settings** page\n2. Configure your Gemini API key\n3. Or set VITE_API_KEY in your .env.local file\n\nFor now, you can explore other features of the platform.`,
      tokens: 50
    };
  }

  try {
    // Use Gemini 3 Pro Preview for complex reasoning as per guidance for "Complex Text Tasks"
    // Or 2.5 Flash for speed. The user asked for "Agent" capabilities so Pro is good,
    // but let's stick to Flash for responsiveness in the demo unless otherwise needed.
    // User requested robust features -> stick to robust model logic.
    // Let's use 'gemini-3-pro-preview' for the 'Agent' feel.

    const modelName = 'gemini-3-pro-preview';

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: [
        ...history.filter(h => h.role !== 'system').map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction || "You are a secure enterprise AI agent.",
        maxOutputTokens: 2048,
      }
    });

    const text = response.text || "No response generated.";

    // Estimate tokens (character count / 4 is a rough heuristic if usage metadata isn't strictly parsed yet)
    // The SDK response might allow access to usage metadata if available in the candidate, 
    // but simple estimation is fine for this demo UI.
    const tokens = Math.ceil(text.length / 4);

    return { text, tokens };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Agent failed to respond securely.");
  }
};

/**
 * Test LLM provider connection
 * Calls backend API to validate credentials
 */
export const testLLMConnection = async (
  config: Partial<LLMProviderConfig>
): Promise<LLMConnectionTestResult> => {
  try {
    const result = await api<LLMConnectionTestResult>('/llm/test-connection', {
      method: 'POST',
      body: JSON.stringify({
        provider: config.provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        endpoint: config.endpoint,
        selectedModel: config.selectedModel
      })
    });

    return {
      ...result,
      timestamp: Date.now()
    };
  } catch (error: any) {
    console.error('LLM connection test failed:', error);
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message || 'Network error',
      timestamp: Date.now()
    };
  }
};