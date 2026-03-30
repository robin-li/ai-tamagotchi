import { test, expect } from '@playwright/test';
import { randomEmail, loginViaUI, TEST_PASSWORD } from './helpers';

const testEmail = randomEmail();

test.describe.serial('Pet initialization flow', () => {
  // Register a fresh account first
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/register');

    await page.locator('input[type="email"]').fill(testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_PASSWORD);
    await passwordInputs.nth(1).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /註冊/ }).click();
    await expect(page).toHaveURL(/\/init/, { timeout: 10000 });
    await page.close();
  });

  test('initialize a pet on /init page', async ({ page }) => {
    await loginViaUI(page, testEmail);
    await page.goto('/init');

    // Enter pet name
    const nameInput = page.getByPlaceholder('輸入電子雞名字...');
    await nameInput.fill('測試雞');

    // Roll stats
    await page.getByRole('button', { name: /隨機初始化/ }).click();

    // Stats should now be visible (4 stat cards)
    await expect(page.locator('text=生命')).toBeVisible();
    await expect(page.locator('text=體力')).toBeVisible();
    await expect(page.locator('text=胃口')).toBeVisible();
    await expect(page.locator('text=體型')).toBeVisible();

    // Resets counter should be visible
    await expect(page.locator('text=剩餘重置次數')).toBeVisible();

    // Confirm and start game
    await page.getByRole('button', { name: /確認，開始遊戲/ }).click();

    // Should redirect to /game
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 });
  });
});
