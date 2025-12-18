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

describe('Backend Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status');
    });
});
