// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import express, { Request, Response, RequestHandler, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query } from './db.ts';
import { authenticateToken, AuthRequest, requireRole } from './middleware/auth.ts';
import { validatePayment, validatePlan, validateBankAccount } from './middleware/validation.ts';
import { csrfProtection, csrfTokenInject } from './middleware/csrf.ts';
import { sanitizeInput, limitComplexity } from './middleware/sanitize.ts';
import { paymentGateway } from './services/paymentGateway.ts';
import { encryptionService } from './services/encryption.ts';

// Import Auth Modules
import authRouter from './routes/auth.ts';
import gatewayRouter from './routes/gateways.ts';
import llmRouter from './routes/llm.ts';
import { seedAdmin } from './seeds/createInitialAdmin.ts';
import { seedPlans } from './seeds/seedPlans.ts';
import { runMigrations } from './services/migrationRunner.ts';

// Prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 [CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware & Logging ---

// 1. Request Logger (Debug)
app.use((req, res, next) => {
  console.log(`📝 [${req.method}] ${req.path} - IP: ${req.ip}`);
  next();
});

// 2. Security Headers
app.use(helmet() as any);

// 3. CORS (Dynamic Origin for Dev)
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow ANY origin in development to avoid "Failed to fetch" errors
    // In production, strict allow-list should be used
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}) as any);

// 4. JSON Parsing
app.use(express.json() as any);

// 5. Input Sanitization & Complexity Limits
app.use('/api/', sanitizeInput({ strict: true }) as any);
app.use('/api/', limitComplexity({ maxDepth: 10, maxKeys: 100 }) as any);

// 6. CSRF Token Injection (for GET requests)
app.use('/api/', csrfTokenInject as any);

// 7. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // High limit for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter as any);

// --- Routes ---

// Auth Routes
app.use('/api/auth', authRouter);

// Gateway Routes
app.use('/api/gateways', gatewayRouter);

// LLM Routes
app.use('/api/llm', llmRouter);

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await query('SELECT 1');
    (res as any).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    console.error('Health check failed:', e);
    // Still return 200 so the frontend knows the API server is up, even if DB is down
    (res as any).status(200).json({ status: 'degraded', db: 'disconnected', error: String(e) });
  }
});

// 1. PRICING & PLANS
// 1. PRICING & PLANS
app.get('/api/pricing/plans', async (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === 'true';
    let queryText = 'SELECT * FROM pricing_plans';
    if (!showAll) {
      queryText += ' WHERE is_active = true';
    }
    queryText += ' ORDER BY price ASC';

    const result = await query(queryText);
    (res as any).json(result.rows);
  } catch (e) {
    console.error('Fetch plans error:', e);
    (res as any).status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.post('/api/pricing/plans', authenticateToken, requireRole(['owner']), validatePlan, async (req: Request, res: Response) => {
  const { name, price, limits, features, isActive, tierId } = (req as any).body;
  try {
    const result = await query(
      'INSERT INTO pricing_plans (id, tenant_id, name, price, limits, features, is_active, tier_id, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [(req as AuthRequest).user?.tenantId, name, price, limits, features, isActive, tierId || name.toLowerCase().replace(/\s+/g, '-')]
    );
    (res as any).json(result.rows[0]);
  } catch (e) {
    (res as any).status(500).json({ error: 'Failed to create plan' });
  }
});

app.put('/api/pricing/plans/:id', authenticateToken, requireRole(['owner']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, limits, features, isActive } = (req as any).body;

  try {
    const result = await query(
      `UPDATE pricing_plans 
       SET name = $1, price = $2, limits = $3, features = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, price, limits, features, isActive, id]
    );

    if (result.rows.length === 0) {
      return (res as any).status(404).json({ error: 'Plan not found' });
    }

    (res as any).json(result.rows[0]);
  } catch (e) {
    console.error('Update plan error:', e);
    (res as any).status(500).json({ error: 'Failed to update plan' });
  }
});

// 2. PAYMENTS & CHARGES
app.post('/api/payments/charge', authenticateToken, validatePayment, async (req: Request, res: Response) => {
  const { amount, currency, gateway, token } = (req as any).body;
  const tenantId = (req as AuthRequest).user?.tenantId!;

  try {
    const result = await paymentGateway.charge(amount, currency, gateway, token, tenantId);

    await query(
      'INSERT INTO transactions (id, tenant_id, amount, currency, gateway, status, gateway_ref, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())',
      [tenantId, amount, currency, gateway, result.status, result.id]
    );

    (res as any).json({ success: true, transaction: result });
  } catch (e: any) {
    console.error('Payment Failed:', e);
    (res as any).status(400).json({ success: false, error: e.message });
  }
});

// 3. BANK ACCOUNTS (Encrypted Storage)
app.get('/api/payouts/accounts', authenticateToken, async (req: Request, res: Response) => {
  const tenantId = (req as AuthRequest).user?.tenantId;
  try {
    const result = await query('SELECT * FROM bank_accounts WHERE tenant_id = $1', [tenantId]);

    const accounts = result.rows.map(row => ({
      ...row,
      routingNumber: '*****' + encryptionService.decrypt(row.encrypted_routing).slice(-4),
      accountNumber: '*****' + encryptionService.decrypt(row.encrypted_account).slice(-4)
    }));
    (res as any).json(accounts);
  } catch (e) {
    console.error('Fetch bank accounts error:', e);
    (res as any).status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

app.post('/api/payouts/accounts', authenticateToken, validateBankAccount, async (req: Request, res: Response) => {
  const { bankName, accountHolderName, routingNumber, accountNumber, country, currency } = (req as any).body;
  const tenantId = (req as AuthRequest).user?.tenantId;

  try {
    const encRouting = encryptionService.encrypt(routingNumber);
    const encAccount = encryptionService.encrypt(accountNumber);

    const result = await query(
      `INSERT INTO bank_accounts (id, tenant_id, bank_name, account_holder, encrypted_routing, encrypted_account, country, currency, created_at, status)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), 'verified') RETURNING id, bank_name, account_holder, country, currency, status, created_at`,
      [tenantId, bankName, accountHolderName, encRouting, encAccount, country, currency]
    );

    // Return the created account with masked sensitive data
    const createdAccount = {
      ...result.rows[0],
      last4: accountNumber.slice(-4),
      routingNumber: '*****' + routingNumber.slice(-4),
      accountNumber: '*****' + accountNumber.slice(-4),
      type: 'checking'
    };

    (res as any).json(createdAccount);
  } catch (e) {
    console.error('Save bank account error:', e);
    (res as any).status(500).json({ error: 'Failed to save bank account' });
  }
});

// DELETE bank account
app.delete('/api/payouts/accounts/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = (req as AuthRequest).user?.tenantId;

  try {
    const result = await query(
      'DELETE FROM bank_accounts WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return (res as any).status(404).json({ error: 'Bank account not found' });
    }

    (res as any).json({ success: true, id });
  } catch (e) {
    console.error('Delete bank account error:', e);
    (res as any).status(500).json({ error: 'Failed to delete bank account' });
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Unhandled Error:', err);
  (res as any).status(500).json({ error: 'Internal Server Error', details: err.message });
});

// --- Server Startup & DB Initialization ---

const initializeDatabase = async () => {
  try {
    console.log('🔄 [INIT] Starting database migrations...');
    await runMigrations();
    console.log('🔄 [INIT] Seeding admin user...');
    await seedAdmin();
    console.log('🔄 [INIT] Seeding pricing plans...');
    await seedPlans();
    console.log('✅ [INIT] Database initialization complete.');
  } catch (e) {
    console.error("⚠️ [INIT] Database initialization failed. The server is running, but DB features may be broken.", e);
  }
};

// Prevent multiple server instances during HMR (Hot Module Replacement) in container
if (process.env.NODE_ENV !== 'test') {
  if (!(globalThis as any).__BACKEND_SERVER_STARTED__) {
    (globalThis as any).__BACKEND_SERVER_STARTED__ = true;

    // Start listening on 0.0.0.0 to allow external connections (required for some containers)
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 [SERVER] Running on http://0.0.0.0:${PORT}`);
      console.log(`🛡️ [CORS] Dynamic origin enabled for development`);

      // Run DB init in background so it doesn't block port binding
      initializeDatabase();
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ [SERVER] Port ${PORT} is already in use. Server is likely already running.`);
      } else {
        console.error('🔥 [SERVER] Failed to start:', err);
      }
    });
  } else {
    console.log(`ℹ️ [SERVER] Server already active on port ${PORT}`);
  }
}

export { app };
