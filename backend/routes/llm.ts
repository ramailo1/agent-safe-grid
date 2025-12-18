/**
 * LLM API Routes
 * 
 * Endpoints for LLM provider management and testing
 */

import express from 'express';
import { testLLMConnection } from '../services/llmTestService.ts';

const router = express.Router();

/**
 * POST /api/llm/test-connection
 * 
 * Test LLM provider connection before saving
 * MOCKS DISABLED - Real API tests enabled
 */
router.post('/test-connection', async (req, res) => {
    const { provider, apiKey, baseUrl, endpoint, selectedModel } = req.body;

    console.log(`🔌 [LLM] Connection test request for provider: ${provider}`);

    try {
        // Input validation
        if (!provider) {
            return res.status(400).json({
                success: false,
                error: 'Provider type is required'
            });
        }

        // Security: Never log API keys
        console.log(`🔌 [LLM] Testing ${provider} provider${baseUrl ? ` at ${baseUrl}` : ''}`);

        // Test connection (REAL API TEST - NO MOCKS)
        const result = await testLLMConnection({
            provider,
            apiKey,
            baseUrl,
            endpoint,
            selectedModel
        });

        // Log result (without sensitive data)
        if (result.success) {
            console.log(`✅ [LLM] Connection test passed for ${provider} (${result.latency}ms)`);
        } else {
            console.warn(`❌ [LLM] Connection test failed for ${provider}: ${result.error}`);
        }

        return res.status(result.success ? 200 : 400).json(result);

    } catch (error: any) {
        console.error('🔥 [LLM] Unexpected error during connection test:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during connection test',
            error: 'An unexpected error occurred'
        });
    }
});

export default router;
