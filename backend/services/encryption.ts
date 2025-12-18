import crypto from 'crypto';

// Encryption Key (Must be 32 bytes for AES-256)
// In production: process.env.ENCRYPTION_KEY
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3', 'utf8'); // Demo key
const IV_LENGTH = 16; // For AES, this is always 16

export const encryptionService = {
  encrypt: (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  },

  decrypt: (text: string): string => {
    const textParts = text.split(':');
    if (textParts.length !== 3) throw new Error('Invalid encrypted text format');
    
    const iv = Buffer.from(textParts[0], 'hex');
    const authTag = Buffer.from(textParts[1], 'hex');
    const encryptedText = textParts[2];
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
};
