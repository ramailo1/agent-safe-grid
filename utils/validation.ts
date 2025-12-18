/**
 * Input validation utility functions
 * Provides reusable validation for common input patterns
 */

export const validators = {
    // Email validation
    email: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'Email is required' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, error: 'Invalid email format' };
        }
        return { valid: true };
    },

    // Password validation
    password: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'Password is required' };
        if (value.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(value)) {
            return { valid: false, error: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(value)) {
            return { valid: false, error: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(value)) {
            return { valid: false, error: 'Password must contain at least one number' };
        }
        return { valid: true };
    },

    // Required field validation
    required: (value: string, fieldName: string = 'This field'): { valid: boolean; error?: string } => {
        if (!value || !value.trim()) {
            return { valid: false, error: `${fieldName} is required` };
        }
        return { valid: true };
    },

    // URL validation
    url: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'URL is required' };
        try {
            new URL(value);
            return { valid: true };
        } catch {
            return { valid: false, error: 'Invalid URL format' };
        }
    },

    // Routing number validation (9 digits)
    routingNumber: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'Routing number is required' };
        if (!/^\d{9}$/.test(value)) {
            return { valid: false, error: 'Routing number must be exactly 9 digits' };
        }
        return { valid: true };
    },

    // Account number validation (4-17 characters)
    accountNumber: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'Account number is required' };
        if (value.length < 4 || value.length > 17) {
            return { valid: false, error: 'Account number must be 4-17 characters' };
        }
        return { valid: true };
    },

    // API key validation (non-empty, reasonable length)
    apiKey: (value: string): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: 'API key is required' };
        if (value.length < 10) {
            return { valid: false, error: 'API key seems too short' };
        }
        return { valid: true };
    },

    // Generic min length validation
    minLength: (value: string, min: number, fieldName: string = 'This field'): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: `${fieldName} is required` };
        if (value.length < min) {
            return { valid: false, error: `${fieldName} must be at least ${min} characters` };
        }
        return { valid: true };
    },

    // Generic max length validation
    maxLength: (value: string, max: number, fieldName: string = 'This field'): { valid: boolean; error?: string } => {
        if (value && value.length > max) {
            return { valid: false, error: `${fieldName} must be at most ${max} characters` };
        }
        return { valid: true };
    },

    // Numeric validation
    numeric: (value: string, fieldName: string = 'This field'): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: `${fieldName} is required` };
        if (!/^\d+$/.test(value)) {
            return { valid: false, error: `${fieldName} must contain only numbers` };
        }
        return { valid: true };
    },

    // Alphanumeric validation
    alphanumeric: (value: string, fieldName: string = 'This field'): { valid: boolean; error?: string } => {
        if (!value) return { valid: false, error: `${fieldName} is required` };
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
            return { valid: false, error: `${fieldName} must contain only letters and numbers` };
        }
        return { valid: true };
    }
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate multiple fields at once
 * Returns first error found or null if all valid
 */
export const validateFields = (
    fields: Array<{ value: string; validator: (value: string) => { valid: boolean; error?: string } }>
): string | null => {
    for (const field of fields) {
        const result = field.validator(field.value);
        if (!result.valid) {
            return result.error || 'Validation error';
        }
    }
    return null;
};
