import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock the database module BEFORE importing the app
vi.mock('../db', () => ({
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    pool: {
        connect: vi.fn(),
        on: vi.fn(),
    },
}));

import { app } from '../server';

describe('Backend Gateways API', () => {
    it('should handle GET /api/gateways requests', async () => {
        // Note: This endpoint might require auth or return 401/403 if not authenticated.
        // We are just checking if the server responds, not necessarily success.
        const res = await request(app).get('/api/gateways');
        // It should not be 404
        expect(res.status).not.toBe(404);
    });
});
