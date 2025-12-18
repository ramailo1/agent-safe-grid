import { test, expect } from '@playwright/test';
import { testUsers, TEST_TIMEOUTS } from './fixtures/testUsers';

test.describe('Settings', () => {
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

        // Navigate to Settings via Sidebar
        await page.getByRole('button', { name: 'Resources' }).click();
        await page.waitForLoadState('networkidle');

        // Wait for Settings page to load
        await expect(page.getByRole('heading', { name: /Settings|Resources/i })).toBeVisible();
    });

    test('should add a new LLM provider', async ({ page }) => {
        // Click Add Custom Provider
        await page.getByText('Add Custom Provider').click();
        await page.waitForTimeout(300); // Wait for modal

        // Fill Form
        await page.getByPlaceholder('My Custom Provider').fill('E2E LLM Provider');
        await page.getByPlaceholder('sk-...').fill('sk-e2e-test-key-123456');
        await page.getByPlaceholder('https://api.example.com/v1').fill('https://api.e2e.com/v1');

        // Test connection before saving
        await page.getByRole('button', { name: 'Test Connection' }).click();
        await expect(page.getByText('Success!')).toBeVisible({ timeout: TEST_TIMEOUTS.apiCall });
        // Save
        await page.getByRole('button', { name: 'Save' }).click();

        // Verify Success Toast
        await expect(page.getByText('Success!')).toBeVisible({
            timeout: TEST_TIMEOUTS.apiCall
        });

        // Verify Card appears
        await expect(page.getByRole('heading', { name: 'E2E LLM Provider' })).toBeVisible();
    });
});
