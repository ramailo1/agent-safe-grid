
import { query } from '../db.ts';
import { passwordService } from '../services/passwordService.ts';
import crypto from 'crypto';

export const seedAdmin = async () => {
  const email = 'admin@agentgrid.com';

  try {
    // Check if admin exists
    const res = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      console.log('Admin user already exists. Skipping seed.');
      return;
    }

    console.log('Seeding initial admin user...');

    // 1. Create HQ Organization
    const orgId = crypto.randomUUID();
    await query(
      "INSERT INTO organizations (id, name, slug, tier, created_at) VALUES ($1, 'Platform HQ', 'platform-hq', 'enterprise', NOW())",
      [orgId]
    );

    // 2. Create Admin User with Hashed Password
    // Temporary initial password - should be changed immediately
    const initialPassword = 'SecureAdminPassword123!';
    const hash = await passwordService.hashPassword(initialPassword);
    const userId = crypto.randomUUID();

    await query(
      "INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_active, created_at) VALUES ($1, $2, $3, $4, 'Master Admin', 'owner', true, NOW())",
      [userId, orgId, email, hash]
    );

    console.log(`Admin seeded successfully. Login with: ${email} / ${initialPassword}`);
  } catch (e) {
    console.error('Failed to seed admin:', e);
  }
};
