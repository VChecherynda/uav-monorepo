import { expect, request, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
  const storageState = JSON.parse(
    readFileSync('e2e/.auth/commander.json', 'utf-8'),
  );
  const rawAuth = storageState.origins[0].localStorage[0].value;
  const authStore = JSON.parse(rawAuth);

  const api = await request.newContext({
    baseURL: 'http://localhost:4000',
    extraHTTPHeaders: { Authorization: `Bearer ${authStore.state.token}` },
  });

  await expect(
    await api.post('/missions/m0/assign', {
      data: { droneId: 'owl-3' },
    }),
  ).toBeOK();

  await expect(
    await api.put('/missions/m0/waypoints', {
      data: [{ lng: 10, lat: 10 }],
    }),
  ).toBeOK();

  await api.dispose();

  await page.goto('/');
});

test('user starts mission and sees it in progress', async ({ page }) => {
  const missionsButton = page.getByRole('button', { name: 'Missions' });
  await missionsButton.click();

  const missionCard = page
    .locator('.card')
    .filter({ hasText: 'Recon sector 1' });

  const startButton = missionCard.getByRole('button', {
    name: 'START',
    exact: true,
  });
  await startButton.click();

  await expect(missionCard.getByText('in-progress')).toBeVisible();
});
