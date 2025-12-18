// Payment Gateway routes
// Similar to bank accounts, but for payment processor configurations

import express, { Request, Response } from 'express';
import { query } from '../db.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';
import { encryptionService } from '../services/encryption.ts';

const router = express.Router();

// GET all payment gateways for tenant
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    const tenantId = (req as AuthRequest).user?.tenantId;

    try {
        const result = await query(
            'SELECT id, tenant_id, gateway_type, name, is_enabled, is_default, created_at FROM payment_gateways WHERE tenant_id = $1',
            [tenantId]
        );

        // Don't return encrypted credentials
        (res as any).json(result.rows);
    } catch (e) {
        console.error('Fetch payment gateways error:', e);
        (res as any).status(500).json({ error: 'Failed to fetch payment gateways' });
    }
});

// GET only enabled payment gateways for user billing
router.get('/enabled', authenticateToken, async (req: Request, res: Response) => {
    const tenantId = (req as AuthRequest).user?.tenantId;

    try {
        const result = await query(
            'SELECT id, tenant_id, gateway_type, name, is_default FROM payment_gateways WHERE tenant_id = $1 AND is_enabled = true ORDER BY is_default DESC, name ASC',
            [tenantId]
        );

        (res as any).json(result.rows);
    } catch (e) {
        console.error('Fetch enabled payment gateways error:', e);
        (res as any).status(500).json({ error: 'Failed to fetch enabled payment gateways' });
    }
});

// POST create new payment gateway
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    const { type, name, isEnabled, isDefault, credentials } = (req as any).body;
    const tenantId = (req as AuthRequest).user?.tenantId;

    try {
        // Encrypt credentials
        const encryptedCreds = encryptionService.encrypt(JSON.stringify(credentials));

        const result = await query(
            `INSERT INTO payment_gateways (id, tenant_id, gateway_type, name, is_enabled, is_default, encrypted_credentials, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()) RETURNING id, gateway_type, name, is_enabled, is_default, created_at`,
            [tenantId, type, name, isEnabled || false, isDefault || false, encryptedCreds]
        );

        (res as any).json(result.rows[0]);
    } catch (e) {
        console.error('Create payment gateway error:', e);
        (res as any).status(500).json({ error: 'Failed to create payment gateway' });
    }
});

// PUT update payment gateway
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, isEnabled, isDefault, credentials } = (req as any).body;
    const tenantId = (req as AuthRequest).user?.tenantId;

    try {
        let encryptedCreds;
        if (credentials) {
            encryptedCreds = encryptionService.encrypt(JSON.stringify(credentials));
        }

        const result = await query(
            `UPDATE payment_gateways 
       SET name = COALESCE($1, name),
           is_enabled = COALESCE($2, is_enabled),
           is_default = COALESCE($3, is_default),
           encrypted_credentials = COALESCE($4, encrypted_credentials)
       WHERE id = $5 AND tenant_id = $6
       RETURNING id, gateway_type, name, is_enabled, is_default`,
            [name, isEnabled, isDefault, encryptedCreds, id, tenantId]
        );

        if (result.rows.length === 0) {
            return (res as any).status(404).json({ error: 'Payment gateway not found' });
        }

        (res as any).json(result.rows[0]);
    } catch (e) {
        console.error('Update payment gateway error:', e);
        (res as any).status(500).json({ error: 'Failed to update payment gateway' });
    }
});

// DELETE payment gateway
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = (req as AuthRequest).user?.tenantId;

    try {
        await query(
            'DELETE FROM payment_gateways WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
        );

        (res as any).json({ success: true });
    } catch (e) {
        console.error('Delete payment gateway error:', e);
        (res as any).status(500).json({ error: 'Failed to delete payment gateway' });
    }
});

export default router;
