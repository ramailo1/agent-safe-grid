
import { query } from '../db.ts';

export const runMigrations = async () => {
  console.log('🔄 [MIGRATION] Checking database schema...');

  try {
    // Separate pgcrypto attempt to avoid failing entire batch if user lacks superuser perms
    try {
      await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    } catch (extError) {
      console.warn("⚠️ [MIGRATION] Could not enable 'pgcrypto'. UUID generation might fail if not already enabled by admin.", extError);
    }

    const sql = `
    -- 1. Organizations Table
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      tier VARCHAR(50) DEFAULT 'free',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 2. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      tenant_id UUID NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'analyst',
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (tenant_id) REFERENCES organizations(id)
    );

    -- 3. Login Attempts (Audit)
    CREATE TABLE IF NOT EXISTS login_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255),
      success BOOLEAN,
      ip_address VARCHAR(45),
      attempted_at TIMESTAMP DEFAULT NOW()
    );

    -- 4. Pricing Plans
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id UUID PRIMARY KEY,
      tenant_id UUID, 
      name VARCHAR(100),
      tier_id VARCHAR(50),
      price DECIMAL(10,2),
      limits JSONB,
      features JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 5. Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY,
      tenant_id UUID,
      amount DECIMAL(10,2),
      currency VARCHAR(3),
      gateway VARCHAR(50),
      status VARCHAR(50),
      gateway_ref VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 6. Bank Accounts
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id UUID PRIMARY KEY,
      tenant_id UUID,
      bank_name VARCHAR(255),
      account_holder VARCHAR(255),
      encrypted_routing VARCHAR(500),
      encrypted_account VARCHAR(500),
      country VARCHAR(2),
      currency VARCHAR(3),
      status VARCHAR(50) DEFAULT 'verified',
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 7. Payment Gateways
    CREATE TABLE IF NOT EXISTS payment_gateways (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      gateway_type VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_enabled BOOLEAN DEFAULT true,
      is_default BOOLEAN DEFAULT false,
      encrypted_credentials TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (tenant_id) REFERENCES organizations(id)
    );
  `;

    await query(sql);
    console.log('✅ [MIGRATION] Database schema verified.');
  } catch (e) {
    console.error('❌ [MIGRATION] Failed to run migrations:', e);
    // Do not exit process, let server try to start anyway, but log critical error
  }
};
