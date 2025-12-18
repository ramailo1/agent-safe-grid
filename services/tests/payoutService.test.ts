import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { payoutService } from '../payoutService';
import { api } from '../api';

// Mock the api module
vi.mock('../api', () => ({
    api: vi.fn(),
}));

describe('payoutService', () => {
    const tenantId = 'test-tenant-id';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('getRevenueStats', () => {
        it('should return mock revenue stats', async () => {
            const stats = await payoutService.getRevenueStats(tenantId);
            expect(stats).toHaveProperty('totalRevenueMonth');
            expect(stats).toHaveProperty('availablePayout');
        });
    });

    describe('saveBankAccount', () => {
        it('should save bank account via API', async () => {
            const mockAccount = {
                bankName: 'Test Bank',
                accountHolderName: 'John Doe',
                routingNumber: '123456789',
                accountNumber: '987654321',
                country: 'US',
                currency: 'USD',
            };

            (api as any).mockResolvedValueOnce({}); // API success

            await payoutService.saveBankAccount(tenantId, mockAccount);

            expect(api).toHaveBeenCalledWith('/payouts/accounts', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('Test Bank'),
            }));
        });

        it('should fallback to localStorage on API failure', async () => {
            const mockAccount = {
                bankName: 'Test Bank',
                accountHolderName: 'John Doe',
                routingNumber: '123456789',
                accountNumber: '987654321',
            };

            (api as any).mockRejectedValue(new Error('API Error'));

            await payoutService.saveBankAccount(tenantId, mockAccount);

            const stored = JSON.parse(localStorage.getItem(`agent_safe_bank_accounts_${tenantId}`) || '[]');
            expect(stored).toHaveLength(1);
            expect(stored[0].bankName).toBe('Test Bank');
        });
    });
});
