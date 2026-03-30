import { test, expect } from '@playwright/test';
import { randomEmail, loginViaUI, TEST_PASSWORD } from './helpers';

const testEmail = randomEmail();
const petName = 'E2E雞';

test.describe.serial('Game page flow', () => {
  // Register + initialize pet
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Register
    await page.goto('/register');
    await page.locator('input[type="email"]').fill(testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_PASSWORD);
    await passwordInputs.nth(1).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /註冊/ }).click();
    await expect(page).toHaveURL(/\/init/, { timeout: 10000 });

    // Init pet
    await page.getByPlaceholder('輸入電子雞名字...').fill(petName);
    await page.getByRole('button', { name: /隨機初始化/ }).click();
    await page.getByRole('button', { name: /確認，開始遊戲/ }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 });

    await page.close();
  });

  test('game page shows pet info', async ({ page }) => {
    await loginViaUI(page, testEmail);

    // Should be on /game (pet already exists)
    await page.goto('/game');
    await page.waitForLoadState('networkidle');

    // Pet name should be displayed
    await expect(page.locator('h1').first()).toContainText(petName);

    // Four stat bars should be visible
    await expect(page.locator('text=生命')).toBeVisible();
    await expect(page.locator('text=體力')).toBeVisible();
    await expect(page.locator('text=胃口')).toBeVisible();
    await expect(page.locator('text=體型')).toBeVisible();

    // Feed button should be visible
    await expect(page.getByRole('button', { name: /餵食/ })).toBeVisible();
  });

  test('clicking feed navigates to /feed', async ({ page }) => {
    await loginViaUI(page, testEmail);
    await page.goto('/game');
    await page.waitForLoadState('networkidle');

    // Click feed button
    await page.getByRole('button', { name: /餵食/ }).click();

    // Should navigate to /feed
    await expect(page).toHaveURL(/\/feed/, { timeout: 5000 });

    // Should show rolling animation title
    await expect(page.locator('text=擲骰中...')).toBeVisible();

    // Wait for result phase
    await expect(page.locator('text=餵食結果')).toBeVisible({ timeout: 10000 });

    // Continue button should appear
    await expect(page.getByRole('button', { name: /繼續/ })).toBeVisible({ timeout: 5000 });

    // Click continue to go back to game
    await page.getByRole('button', { name: /繼續/ }).click();
    await expect(page).toHaveURL(/\/game/, { timeout: 5000 });
  });
});
