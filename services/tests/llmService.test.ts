import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectPII, generateSignature, generateAgentResponse } from '../llmService';
import { Provider } from '../../types';

// Hoist the mock function so it's available in the factory
const { generateContentMock } = vi.hoisted(() => ({
    generateContentMock: vi.fn(),
}));

// Mock the module returning a class
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: generateContentMock
            };
            constructor() { }
        }
    };
});

describe('llmService', () => {
    describe('detectPII', () => {
        it('should detect email addresses', () => {
            const result = detectPII('Contact me at test@example.com');
            expect(result.hasPII).toBe(true);
            expect(result.redactedText).toContain('[EMAIL_REDACTED]');
        });

        it('should detect phone numbers', () => {
            const result = detectPII('Call 555-123-4567');
            expect(result.hasPII).toBe(true);
            expect(result.redactedText).toContain('[PHONE_REDACTED]');
        });

        it('should return false for safe text', () => {
            const result = detectPII('Hello world');
            expect(result.hasPII).toBe(false);
            expect(result.redactedText).toBe('Hello world');
        });
    });

    describe('generateSignature', () => {
        it('should generate a hex signature', async () => {
            const sig = await generateSignature('test', 123456);
            expect(sig).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex string
        });
    });

    describe('generateAgentResponse', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            vi.stubEnv('VITE_API_KEY', 'test-key');
        });

        it('should call Gemini API when provider is GEMINI', async () => {
            generateContentMock.mockResolvedValueOnce({
                text: 'Mock response',
            });

            const response = await generateAgentResponse(
                [],
                'Hello',
                Provider.GEMINI
            );

            expect(generateContentMock).toHaveBeenCalled();
            expect(response.text).toBe('Mock response');
        });

        it('should return simulation for other providers', async () => {
            const response = await generateAgentResponse(
                [],
                'Hello',
                Provider.OPENAI
            );

            expect(response.text).toContain('[SIMULATION]');
            expect(generateContentMock).not.toHaveBeenCalled();
        });
    });
});
