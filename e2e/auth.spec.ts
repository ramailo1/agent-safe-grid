import { test, expect } from '@playwright/test';
import { testUsers, TEST_TIMEOUTS } from './fixtures/testUsers';

test.describe('Authentication', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        await page.goto('/');

        // Wait for landing page to load
        await page.waitForLoadState('networkidle');

        // Click Log In on Landing Page
        await page.getByRole('button', { name: 'Log In' }).first().click();

        // Wait for auth page and check heading
        await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({
            timeout: TEST_TIMEOUTS.navigation
        });

        // Fill form with test user credentials
        await page.getByPlaceholder('name@company.com').fill(testUsers.admin.email);
        await page.getByPlaceholder('••••••••').fill(testUsers.admin.password);

        // Submit
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for navigation and dashboard load
        await page.waitForURL('/', { timeout: TEST_TIMEOUTS.navigation });
        await page.waitForLoadState('networkidle');

        // Expect to see Dashboard content
        await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible({
            timeout: TEST_TIMEOUTS.pageLoad
        });
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/');

        // Wait for page load
        await page.waitForLoadState('networkidle');

        // Click Log In on Landing Page
        await page.getByRole('button', { name: 'Log In' }).first().click();

        // Wait for form to be ready
        await expect(page.getByPlaceholder('name@company.com')).toBeVisible();

        await page.getByPlaceholder('name@company.com').fill('wrong@example.com');
        await page.getByPlaceholder('••••••••').fill('wrongpass');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Expect exact error message from API (backend returns "Invalid email or password")
        await expect(page.getByText('Invalid email or password')).toBeVisible({
            timeout: TEST_TIMEOUTS.apiCall
        });
    });
});
