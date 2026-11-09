import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/operator.json' });

test('operator has no access to unit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'UNIT' })).toHaveCount(0);

  await page.goto('/unit');
  await expect(page).toHaveURL('/');
});
