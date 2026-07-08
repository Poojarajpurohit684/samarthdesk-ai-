import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('404 route redirects to landing page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    // App redirects unknown routes to '/'
    await expect(page).toHaveURL('/');
  });

  test('unauthorized page renders correctly', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toBeVisible();
  });

  test('verify-email page handles missing token gracefully', async ({ page }) => {
    await page.goto('/verify-email');
    await expect(page.getByRole('heading', { name: 'Verification Failed' })).toBeVisible();
  });

  test('reset-password page redirects when token is missing', async ({ page }) => {
    await page.goto('/reset-password');
    // Should redirect to forgot-password when no token
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
