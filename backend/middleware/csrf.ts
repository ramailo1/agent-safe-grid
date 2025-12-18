/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing operations
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store tokens in memory (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of csrfTokens.entries()) {
        if (data.expires < now) {
            csrfTokens.delete(sessionId);
        }
    }
}, 60000); // Clean every minute

/**
 * Generate a CSRF token for a session
 */
export const generateCsrfToken = (sessionId: string): string => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    csrfTokens.set(sessionId, { token, expires });

    return token;
};

/**
 * Middleware to attach CSRF token to response
 */
export const csrfTokenInject = (req: Request, res: Response, next: NextFunction) => {
    const sessionId = (req as any).sessionId || req.ip || 'anonymous';
    const token = generateCsrfToken(sessionId);

    // Attach token to response header
    res.setHeader('X-CSRF-Token', token);

    // Make token available on request for convenience
    (req as any).csrfToken = token;

    next();
};

/**
 * Middleware to validate CSRF token on state-changing requests
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Only validate on state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const sessionId = (req as any).sessionId || req.ip || 'anonymous';
    const clientToken = req.headers['x-csrf-token'] as string;

    if (!clientToken) {
        return (res as any).status(403).json({
            error: 'CSRF token missing',
            message: 'CSRF token is required for this operation'
        });
    }

    const stored = csrfTokens.get(sessionId);

    if (!stored) {
        return (res as any).status(403).json({
            error: 'CSRF token invalid',
            message: 'CSRF token not found or expired'
        });
    }

    if (stored.token !== clientToken) {
        return (res as any).status(403).json({
            error: 'CSRF token mismatch',
            message: 'CSRF token does not match'
        });
    }

    if (stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return (res as any).status(403).json({
            error: 'CSRF token expired',
            message: 'CSRF token has expired, please refresh'
        });
    }

    // Token is valid, proceed
    next();
};

/**
 * Optional: Double-submit cookie pattern
 * More secure for SPA applications
 */
export const csrfDoubleSubmit = (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // Set CSRF cookie on safe methods
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Must be readable by JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });
        return next();
    }

    // Validate on state-changing methods
    const cookieToken = req.cookies['XSRF-TOKEN'];
    const headerToken = req.headers['x-xsrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return (res as any).status(403).json({
            error: 'CSRF validation failed',
            message: 'CSRF tokens do not match'
        });
    }

    next();
};
