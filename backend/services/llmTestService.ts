/**
 * LLM Provider Connection Testing Service
 * 
 * Tests API credentials and connectivity for various LLM providers.
 * Used to validate configuration before saving provider settings.
 */

interface TestResult {
    success: boolean;
    message: string;
    latency?: number;
    error?: string;
}

/**
 * Test Google Gemini API connectivity
 */
export async function testGoogleGemini(
    apiKey: string,
    model: string = 'gemini-pro'
): Promise<TestResult> {
    const startTime = Date.now();

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'test' }] }]
                }),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            }
        );

        const latency = Date.now() - startTime;

        if (response.ok) {
            return {
                success: true,
                message: `Successfully connected to Google Gemini (${model})`,
                latency
            };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            message: 'Failed to connect to Google Gemini',
            error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to connect to Google Gemini',
            error: error.name === 'AbortError'
                ? 'Connection timeout (10s exceeded)'
                : error.message || 'Unknown network error'
        };
    }
}

/**
 * Test OpenAI-compatible API connectivity
 */
export async function testOpenAI(
    apiKey: string,
    baseUrl: string = 'https://api.openai.com/v1',
    model: string = 'gpt-3.5-turbo'
): Promise<TestResult> {
    const startTime = Date.now();

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            }),
            signal: AbortSignal.timeout(10000)
        });

        const latency = Date.now() - startTime;

        if (response.ok) {
            return {
                success: true,
                message: `Successfully connected to OpenAI-compatible API (${model})`,
                latency
            };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            message: 'Failed to connect to OpenAI API',
            error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to connect to OpenAI API',
            error: error.name === 'AbortError'
                ? 'Connection timeout (10s exceeded)'
                : error.message || 'Unknown network error'
        };
    }
}

/**
 * Test Anthropic Claude API connectivity
 */
export async function testAnthropic(
    apiKey: string,
    model: string = 'claude-3-opus-20240229'
): Promise<TestResult> {
    const startTime = Date.now();

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
            }),
            signal: AbortSignal.timeout(10000)
        });

        const latency = Date.now() - startTime;

        if (response.ok) {
            return {
                success: true,
                message: `Successfully connected to Anthropic Claude (${model})`,
                latency
            };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            message: 'Failed to connect to Anthropic API',
            error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to connect to Anthropic API',
            error: error.name === 'AbortError'
                ? 'Connection timeout (10s exceeded)'
                : error.message || 'Unknown network error'
        };
    }
}

/**
 * Test Ollama local instance connectivity
 */
export async function testOllama(
    baseUrl: string = 'http://localhost:11434'
): Promise<TestResult> {
    const startTime = Date.now();

    try {
        // Test /api/tags endpoint to list available models
        const response = await fetch(`${baseUrl}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(10000)
        });

        const latency = Date.now() - startTime;

        if (response.ok) {
            const data = await response.json();
            const modelCount = data.models?.length || 0;
            return {
                success: true,
                message: `Successfully connected to Ollama (${modelCount} models available)`,
                latency
            };
        }

        return {
            success: false,
            message: 'Failed to connect to Ollama',
            error: `HTTP ${response.status}: ${response.statusText}`
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to connect to Ollama',
            error: error.name === 'AbortError'
                ? 'Connection timeout (10s exceeded)'
                : 'Is Ollama running on this machine?'
        };
    }
}

/**
 * Test custom OpenAI-compatible provider
 */
export async function testCustomProvider(config: {
    apiKey?: string;
    baseUrl: string;
    endpoint?: string;
    model?: string;
}): Promise<TestResult> {
    const { apiKey, baseUrl, endpoint, model = 'default' } = config;
    const url = endpoint ? `${baseUrl}${endpoint}` : `${baseUrl}/chat/completions`;
    const startTime = Date.now();

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            }),
            signal: AbortSignal.timeout(10000)
        });

        const latency = Date.now() - startTime;

        if (response.ok) {
            return {
                success: true,
                message: `Successfully connected to custom provider`,
                latency
            };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            message: 'Failed to connect to custom provider',
            error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'Failed to connect to custom provider',
            error: error.name === 'AbortError'
                ? 'Connection timeout (10s exceeded)'
                : error.message || 'Unknown network error'
        };
    }
}

/**
 * Main test function - routes to appropriate provider test
 */
export async function testLLMConnection(config: {
    provider: 'google' | 'openai' | 'ollama' | 'anthropic' | 'custom';
    apiKey?: string;
    baseUrl?: string;
    endpoint?: string;
    selectedModel?: string;
}): Promise<TestResult> {
    const { provider, apiKey, baseUrl, endpoint, selectedModel } = config;

    // Validation
    if (provider !== 'ollama' && !apiKey) {
        return {
            success: false,
            message: 'API key is required',
            error: 'Please provide an API key'
        };
    }

    switch (provider) {
        case 'google':
            return testGoogleGemini(apiKey!, selectedModel);

        case 'openai':
            return testOpenAI(apiKey!, baseUrl, selectedModel);

        case 'anthropic':
            return testAnthropic(apiKey!, selectedModel);

        case 'ollama':
            return testOllama(baseUrl);

        case 'custom':
            if (!baseUrl) {
                return {
                    success: false,
                    message: 'Base URL is required for custom providers',
                    error: 'Please provide a base URL'
                };
            }
            return testCustomProvider({ apiKey, baseUrl, endpoint, model: selectedModel });

        default:
            return {
                success: false,
                message: 'Unknown provider type',
                error: `Provider '${provider}' is not supported`
            };
    }
}
