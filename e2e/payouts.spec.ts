import { test, expect } from '@playwright/test';
import { testUsers, TEST_TIMEOUTS } from './fixtures/testUsers';

test.describe('Payouts Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name: 'Log In' }).first().click();
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

        await page.getByPlaceholder('name@company.com').fill(testUsers.admin.email);
        await page.getByPlaceholder('••••••••').fill(testUsers.admin.password);
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for dashboard
        await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible({
            timeout: TEST_TIMEOUTS.pageLoad
        });
    });

    test('should add a new payment gateway', async ({ page }) => {
        // Navigate to Revenue (Payouts)
        await page.getByRole('button', { name: 'Revenue' }).click();
        await page.waitForLoadState('networkidle');

        // Wait for page to load
        await expect(page.getByRole('heading', { name: 'Revenue & Payouts' })).toBeVisible();

        // Navigate to Payment Methods tab
        await expect(page.getByRole('button', { name: 'Payment Methods' })).toBeVisible();
        await page.getByRole('button', { name: 'Payment Methods' }).click();
        await page.waitForTimeout(500); // Brief wait for tab switch animation

        // Wait for Add Payment Method button to be visible
        await expect(page.getByRole('button', { name: 'Add Payment Method' })).toBeVisible({
            timeout: TEST_TIMEOUTS.apiCall
        });

        // Open Modal
        await page.getByRole('button', { name: 'Add Payment Method' }).click();
        await page.waitForTimeout(300); // Wait for modal animation

        // Fill Form
        await page.getByPlaceholder('e.g. Corporate Stripe').fill('E2E Test Stripe');

        // Using locator by placeholder for API key input
        await page.getByPlaceholder('sk_live_... or sk_test_...').fill('sk_test_e2e_12345');

        // Save
        await page.getByRole('button', { name: 'Save Configuration' }).click();

        // Verify Success Toast
        await expect(page.getByText('Success!')).toBeVisible({
            timeout: TEST_TIMEOUTS.apiCall
        });

        // Verify Card appears
        await expect(page.getByRole('heading', { name: 'E2E Test Stripe' })).toBeVisible();
    });
});
