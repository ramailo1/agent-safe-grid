/**
 * Input Sanitization Middleware
 * Protects against XSS, SQL injection, and other injection attacks
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input to prevent XSS attacks
 */
const sanitizeString = (input: string): string => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Validate that input doesn't contain SQL injection patterns
 */
const hasSqlInjection = (input: string): boolean => {
    if (typeof input !== 'string') return false;

    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(UNION\s+SELECT)/i,
        /(-{2}|\/\*|\*\/)/,  // SQL comments
        /(;|\||&)/,  // Command separators
        /(0x[0-9a-f]+)/i,  // Hex values
        /(CHAR\(|CHR\(|ASCII\()/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Validate that input doesn't contain dangerous patterns
 */
const hasDangerousPatterns = (input: string): boolean => {
    if (typeof input !== 'string') return false;

    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // Script tags
        /javascript:/gi,  // JavaScript protocol
        /on\w+\s*=/gi,  // Event handlers
        /eval\(/gi,  // eval() calls
        /expression\(/gi,  // CSS expressions
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Middleware to sanitize all request body inputs
 */
export const sanitizeInput = (options = { strict: false }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body && typeof req.body === 'object') {
            try {
                // Check for dangerous patterns first
                const bodyStr = JSON.stringify(req.body);

                if (options.strict) {
                    if (hasSqlInjection(bodyStr)) {
                        return (res as any).status(400).json({
                            error: 'Invalid input',
                            message: 'Input contains potentially dangerous SQL patterns'
                        });
                    }

                    if (hasDangerousPatterns(bodyStr)) {
                        return (res as any).status(400).json({
                            error: 'Invalid input',
                            message: 'Input contains potentially dangerous patterns'
                        });
                    }
                }

                // Sanitize the body
                req.body = sanitizeObject(req.body);

            } catch (e) {
                console.error('[Sanitization] Error sanitizing request body:', e);
                return (res as any).status(400).json({
                    error: 'Invalid input',
                    message: 'Failed to process request body'
                });
            }
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        // Sanitize URL parameters
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        next();
    };
};

/**
 * Middleware to validate specific fields against whitelist patterns
 */
export const validateFields = (fieldRules: Record<string, RegExp>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.body) return next();

        for (const [field, pattern] of Object.entries(fieldRules)) {
            const value = req.body[field];

            if (value && !pattern.test(String(value))) {
                return (res as any).status(400).json({
                    error: 'Validation failed',
                    message: `Field '${field}' contains invalid characters`,
                    field
                });
            }
        }

        next();
    };
};

/**
 * Middleware to limit request body size and complexity
 */
export const limitComplexity = (options = { maxDepth: 10, maxKeys: 100 }) => {
    const checkDepth = (obj: any, depth = 0): number => {
        if (depth > options.maxDepth) return depth;
        if (obj === null || typeof obj !== 'object') return depth;

        return Math.max(
            depth,
            ...Object.values(obj).map(val => checkDepth(val, depth + 1))
        );
    };

    const countKeys = (obj: any): number => {
        if (obj === null || typeof obj !== 'object') return 0;

        let count = Object.keys(obj).length;
        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                count += countKeys(value);
            }
        }
        return count;
    };

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.body || typeof req.body !== 'object') return next();

        const depth = checkDepth(req.body);
        const keyCount = countKeys(req.body);

        if (depth > options.maxDepth) {
            return (res as any).status(400).json({
                error: 'Request too complex',
                message: `Object nesting exceeds maximum depth of ${options.maxDepth}`
            });
        }

        if (keyCount > options.maxKeys) {
            return (res as any).status(400).json({
                error: 'Request too complex',
                message: `Object contains too many keys (max: ${options.maxKeys})`
            });
        }

        next();
    };
};
