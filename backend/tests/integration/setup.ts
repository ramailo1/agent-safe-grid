import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';

// Test DB Config (matches docker-compose.test.yml)
const pool = new Pool({
    connectionString: 'postgres://testuser:testpassword@localhost:5433/testdb',
});

beforeAll(async () => {
    // Wait for DB to be ready (simple retry logic could be added here if needed)
    try {
        await pool.query('SELECT 1');
        console.log('✅ Connected to Test DB');
    } catch (e) {
        console.warn('⚠️ Failed to connect to Test DB. Integration tests may fail if they rely on it.');
        // Do not throw, so other tests can run
    }
});

beforeEach(async () => {
    // Clean up tables
    try {
        await pool.query('TRUNCATE TABLE transactions, bank_accounts, pricing_plans CASCADE');
    } catch (e) {
        // Ignore cleanup errors if DB is not connected
    }
});

afterAll(async () => {
    await pool.end();
});

export { pool };
