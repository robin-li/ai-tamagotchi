import { Page } from '@playwright/test';

const TEST_PASSWORD = 'Test1234!';

export function randomEmail(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `test_${ts}_${rand}@e2e.test`;
}

export async function loginViaUI(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /密碼|password/i }).first().fill(password);
  await page.getByRole('button', { name: /登入/i }).click();
  // Wait for navigation away from login
  await page.waitForURL(/\/(init|game)/);
}

export { TEST_PASSWORD };
