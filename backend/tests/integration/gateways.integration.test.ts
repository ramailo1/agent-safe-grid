import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock DB to use test pool (Dynamic import to handle hoisting)
vi.mock('../../db', async () => {
    const { pool } = await import('./setup');
    return {
        query: async (text: string, params: any[]) => pool.query(text, params),
    };
});

// Mock Auth Middleware to bypass JWT and inject user
vi.mock('../../middleware/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../middleware/auth')>();
    return {
        ...actual,
        authenticateToken: (req: any, res: any, next: any) => {
            req.user = {
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'admin',
                tenantId: 'test-tenant-id'
            };
            next();
        }
    };
});

// Import app AFTER mocks
import { app } from '../../server';
import { pool } from './setup';

describe('Integration: Gateways API', () => {
    const tenantId = 'test-tenant-id';

    beforeEach(async () => {
        // Clean up gateways for this tenant
        await pool.query('DELETE FROM payment_gateways WHERE tenant_id = $1', [tenantId]);
    });

    it.skipIf(process.env.CI !== 'true')('should create a new payment gateway', async () => {
        const payload = {
            type: 'stripe',
            name: 'Test Stripe',
            isEnabled: true,
            isDefault: true,
            credentials: { apiKey: 'sk_test_123' }
        };

        const res = await request(app)
            .post('/api/gateways')
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Stripe');
        expect(res.body.gateway_type).toBe('stripe');

        // Verify in DB
        const dbResult = await pool.query('SELECT * FROM payment_gateways WHERE id = $1', [res.body.id]);
        expect(dbResult.rows).toHaveLength(1);
        expect(dbResult.rows[0].encrypted_credentials).toBeDefined();
        expect(dbResult.rows[0].encrypted_credentials).not.toBe(JSON.stringify(payload.credentials));
    });

    it.skipIf(process.env.CI !== 'true')('should get all gateways for tenant', async () => {
        // Insert a gateway directly
        await pool.query(
            `INSERT INTO payment_gateways (id, tenant_id, gateway_type, name, is_enabled, is_default, encrypted_credentials, created_at)
       VALUES (gen_random_uuid(), $1, 'paypal', 'Test PayPal', true, false, 'fake-enc', NOW())`,
            [tenantId]
        );

        const res = await request(app).get('/api/gateways');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Test PayPal');
        // Should not return credentials
        expect(res.body[0]).not.toHaveProperty('encrypted_credentials');
        expect(res.body[0]).not.toHaveProperty('credentials');
    });

    it.skipIf(process.env.CI !== 'true')('should delete a gateway', async () => {
        // Create one first
        const insertRes = await pool.query(
            `INSERT INTO payment_gateways (id, tenant_id, gateway_type, name, is_enabled, is_default, encrypted_credentials, created_at)
       VALUES (gen_random_uuid(), $1, 'stripe', 'To Delete', true, false, 'fake-enc', NOW()) RETURNING id`,
            [tenantId]
        );
        const gatewayId = insertRes.rows[0].id;

        const res = await request(app).delete(`/api/gateways/${gatewayId}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify gone from DB
        const dbResult = await pool.query('SELECT * FROM payment_gateways WHERE id = $1', [gatewayId]);
        expect(dbResult.rows).toHaveLength(0);
    });
});
