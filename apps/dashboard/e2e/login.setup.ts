import { test as setup, expect } from '@playwright/test';

setup('login as commander', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@uav.test');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'AUTHENTICATE' }).click();
  await expect(page.getByText('Falcon-1', { exact: true })).toBeVisible();

  await page.context().storageState({ path: 'e2e/.auth/commander.json' });
});
