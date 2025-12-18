
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db.ts';
import { passwordService } from '../services/passwordService.ts';

const router = express.Router();

// ⚠️ SECURITY: JWT_SECRET must be set in environment variables
// Never use a default secret in production
if (!process.env.JWT_SECRET) {
  console.error('❌ [AUTH] FATAL: JWT_SECRET environment variable is not set');
  console.error('   Generate a strong secret: openssl rand -base64 32');
  console.error('   Set JWT_SECRET in your .env file');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  console.log(`🔑 [AUTH] Login request received for: ${email}`);

  try {
    // 0. Input Validation
    if (!email || !password) {
      console.warn('⚠️ [AUTH] Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Find User in Database
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.warn(`⚠️ [AUTH] User not found: ${email}`);
      // Log failed attempt (user not found)
      try {
        await query('INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, false, $2)', [email, ip]);
      } catch (e) { /* ignore log error */ }
      // Return 401 Unauthorized immediately
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Verify Password Hash using Bcrypt
    console.log(`🔐 [AUTH] Verifying password for user ID: ${user.id}`);

    let isPasswordValid = false;
    try {
      isPasswordValid = await passwordService.verifyPassword(password, user.password_hash);
      console.log(`🔐 [AUTH] Password verification result: ${isPasswordValid}`);
    } catch (cryptoError) {
      console.error('🔥 [AUTH] Password verification error:', cryptoError);
      return res.status(500).json({ error: 'Security verification failed' });
    }

    // 3. Enforce Verification Result
    if (!isPasswordValid) {
      console.warn(`⛔ [AUTH] Invalid password for: ${email}`);
      try {
        await query('INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, false, $2)', [email, ip]);
      } catch (e) { /* ignore log error */ }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 4. Get Organization details (Tenant Context)
    const orgResult = await query('SELECT * FROM organizations WHERE id = $1', [user.tenant_id]);
    const organization = orgResult.rows[0];

    if (!organization) {
      console.error(`❌ [AUTH] Orphaned user account: ${user.id} (No Organization)`);
      return res.status(500).json({ error: 'Account configuration error. Please contact support.' });
    }

    // 5. Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 6. Log Success
    try {
      await query('INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, true, $2)', [email, ip]);
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    } catch (logError) {
      console.warn('⚠️ [AUTH] Failed to update login stats (non-critical)', logError);
    }

    console.log(`🚀 [AUTH] Login successful for: ${email}`);

    // 7. Return Session Data
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.tenant_id
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        tier: organization.tier
      },
      subscription: {
        status: 'active',
        planName: organization.tier
      }
    });

  } catch (e: any) {
    console.error('🔥 [AUTH] Critical Uncaught Error:', e);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, orgName } = req.body;
  console.log(`👤 [AUTH] Register attempt for: ${email}`);

  try {
    if (!email || !password || !orgName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Validate Strength
    const strength = passwordService.validateStrength(password);
    if (!strength.valid) {
      return res.status(400).json({ error: strength.message });
    }

    // 2. Check existing email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 3. Create Organization (Tenant)
    const orgId = crypto.randomUUID();
    await query(
      'INSERT INTO organizations (id, name, slug, tier, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [orgId, orgName, orgName.toLowerCase().replace(/\s+/g, '-'), 'free']
    );

    // 4. Hash Password
    const hash = await passwordService.hashPassword(password);

    // 5. Create User
    const userId = crypto.randomUUID();
    await query(
      'INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, true, NOW())',
      [userId, orgId, email, hash, email.split('@')[0], 'owner']
    );

    // 6. Auto-login (Generate Token)
    const token = jwt.sign(
      { id: userId, email, role: 'owner', tenantId: orgId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ [AUTH] Registration success: ${email}`);

    return res.status(201).json({
      token,
      user: { id: userId, email, name: email.split('@')[0], role: 'owner', organizationId: orgId },
      organization: { id: orgId, name: orgName, slug: orgName.toLowerCase().replace(/\s+/g, '-'), tier: 'free' },
      subscription: { status: 'active', planName: 'free' }
    });

  } catch (e: any) {
    console.error('🔥 [AUTH] Registration Error:', e);
    return res.status(500).json({ error: 'Registration failed', details: e.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log(`❓ [AUTH] Password reset requested for ${email}`);
  // Mock implementation - in prod, send email via SendGrid/AWS SES
  return res.json({ message: 'If an account exists, a reset link has been sent.' });
});

export default router;
