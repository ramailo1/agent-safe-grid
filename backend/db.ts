

import { Pool } from 'pg';

// Database Configuration
// ⚠️ SECURITY: DATABASE_URL must be set in environment variables
// Never hardcode credentials in source code
if (!process.env.DATABASE_URL) {
  console.error('❌ [DB] FATAL: DATABASE_URL environment variable is not set');
  console.error('   Set DATABASE_URL in your .env file or environment');
  console.error('   Example: DATABASE_URL=postgres://user:pass@host:port/database');
  process.exit(1); // Exit immediately if no DATABASE_URL
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false, // Required for Aiven and other cloud providers with self-signed certs
  } : false,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Attempt initial connection to verify config with a strict timeout for the PROBE only
const probeConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ [DB] Successfully connected to PostgreSQL');
    client.release();
  } catch (err: any) {
    console.error('❌ [DB] Failed to connect to PostgreSQL:', err.message);
    console.error('   Check your DATABASE_URL, Firewall rules, or SSL settings.');
  }
};

probeConnection();

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`⚠️ [DB] Slow query (${duration}ms): ${text.substring(0, 100)}...`);
    }
    return res;
  } catch (error) {
    console.error('Database Query Failed:', { text: text.substring(0, 200), error });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
