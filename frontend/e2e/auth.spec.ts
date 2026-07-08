import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Samarthdesk AI/);
    await expect(page.getByText('Samarthdesk AI')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot your password?' })).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('shows validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('shows validation errors on empty register submit', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('First name must be at least 2 characters')).toBeVisible();
  });

  test('forgot password page renders correctly', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
  });

  test('unauthenticated user redirects to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user redirects to login from tickets', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user redirects to login from admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
