import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/testUsers';

test.describe('Admin Plans Sync', () => {
    test('should sync plan changes from Admin to Billing page', async ({ page }) => {
        // 1. Login
        // 1. Login
        await page.goto('/');
        await page.click('text=Log In');
        await page.fill('input[type="email"]', testUsers.admin.email);
        await page.fill('input[type="password"]', testUsers.admin.password);
        await page.click('button[type="submit"]');
        // Wait for dashboard to load - check for a dashboard-specific element
        await expect(page.locator('text=Control Center')).toBeVisible();

        // 2. Navigate to Admin -> Plans
        await page.click('text=Control Center'); // Assuming sidebar link
        await page.click('text=Plans & Pricing');

        // 3. Edit "Pro Security" Plan
        // Find the container for Pro Security and click Edit
        const proPlanCard = page.locator('div', { hasText: 'Pro Security' }).filter({ hasText: '$99' }); // Initial state
        // Note: If price was changed in previous failed run, this might fail. We'll assume fresh state or handle dynamic finding.
        const proPlanContainer = page.locator('div', { hasText: 'Pro Security' }).first();

        await proPlanContainer.getByRole('button', { name: 'Edit Config' }).click();

        // 4. Change Price
        // Use locator based on nearby text since label is not associated
        await page.locator('div').filter({ hasText: /^Price \(Monthly\)$/ }).locator('input').fill('199');

        await page.click('button:has-text("Save Changes")');

        // Wait for update
        await expect(proPlanContainer).toContainText('$199');

        // 5. Verify on Billing Page
        await page.click('text=Billing & Plan'); // Sidebar link
        await expect(page.locator('div', { hasText: 'Pro Security' })).toContainText('$199');

        // 6. Deactivate Plan
        await page.click('text=Control Center');
        await page.click('text=Plans & Pricing');

        // Click Deactivate on Pro Security
        // We need to be careful to click the right button.
        // The container reference might be stale? Re-query.
        const proPlanContainer2 = page.locator('div', { hasText: 'Pro Security' }).first();
        await proPlanContainer2.getByRole('button', { name: 'Deactivate' }).click();

        // Verify it says "INACTIVE" or button changes to "Activate"
        await expect(proPlanContainer2.getByRole('button', { name: 'Activate' })).toBeVisible();

        // 7. Verify removed from Billing Page
        await page.click('text=Billing & Plan');
        await expect(page.locator('div', { hasText: 'Pro Security' })).not.toBeVisible();

        // 8. Cleanup: Revert changes
        await page.click('text=Control Center');
        await page.click('text=Plans & Pricing');
        const proPlanContainer3 = page.locator('div', { hasText: 'Pro Security' }).first();
        await proPlanContainer3.getByRole('button', { name: 'Activate' }).click();

        await proPlanContainer3.getByRole('button', { name: 'Edit Config' }).click();
        await page.locator('div').filter({ hasText: /^Price \(Monthly\)$/ }).locator('input').fill('99');
        await page.click('button:has-text("Save Changes")');
    });
});
