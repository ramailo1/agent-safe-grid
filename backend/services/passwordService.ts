
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const passwordService = {
  /**
   * Hash a plaintext password using bcrypt
   */
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Verify a plaintext password against a hash
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Validate password strength
   * Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  validateStrength: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 12) {
      return { valid: false, message: 'Password must be at least 12 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character.' };
    }
    return { valid: true };
  }
};
