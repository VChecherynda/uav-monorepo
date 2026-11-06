import { test, expect } from '@playwright/test';

test.beforeEach(({ page }) => page.goto('/'));

test('operator sees the fleet', async ({ page }) => {
  await expect(page.getByText('UAV FLEET').first()).toBeVisible();
  await page.getByText('Falcon-1', { exact: true }).click();
  await expect(
    page.getByText('SELECT DRONE TO VIEW TELEMETRY'),
  ).not.toBeVisible();
});

test('operator issues RTH and sees optimistic update then confirmation', async ({
  page,
}) => {
  const falconCard = page.locator('.card').filter({ hasText: 'Falcon-1' });

  const rthButton = falconCard.getByRole('button', { name: 'RTH' });
  await rthButton.click();

  // OPTIMISTIC
  await expect(page.getByText('IN_AIR · RTL')).toBeVisible();

  // SERVER CONFIRMED
  await expect(page.getByText('ACKNOWLEDGED')).toBeVisible();
});
