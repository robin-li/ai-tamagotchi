import { test, expect } from '@playwright/test';
import { randomEmail, loginViaUI, TEST_PASSWORD } from './helpers';

// Shared email for the test suite — register first, then login with same account
let testEmail: string;

test.describe.serial('Auth flow', () => {
  test.beforeAll(() => {
    testEmail = randomEmail();
  });

  test('register a new user and redirect to /init', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.locator('label:has-text("Email") + input, label:has-text("Email") ~ input').first().fill(testEmail);

    // Password fields — first one is "密碼", second is "確認密碼"
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_PASSWORD);
    await passwordInputs.nth(1).fill(TEST_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /註冊/ }).click();

    // Should redirect to /init
    await expect(page).toHaveURL(/\/init/, { timeout: 10000 });
  });

  test('login with registered account', async ({ page }) => {
    await loginViaUI(page, testEmail);

    // Should redirect to /init or /game
    await expect(page).toHaveURL(/\/(init|game)/);
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('WrongPass1!');
    await page.getByRole('button', { name: /登入/ }).click();

    // Should show error and stay on login
    await expect(page.locator('.border-orange-dark')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
