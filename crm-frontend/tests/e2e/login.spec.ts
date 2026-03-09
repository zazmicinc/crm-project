import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders all login elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('password field is masked', async ({ page }) => {
    const pwd = page.getByPlaceholder(/password/i);
    await expect(pwd).toHaveAttribute('type', 'password');
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('wrong@email.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|incorrect|failed|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('admin@crm.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard|home|\/$/, { timeout: 8000 });
  });

  test('successful login stores token in localStorage', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('admin@crm.com');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/dashboard|home|\/$/, { timeout: 8000 });
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

});
