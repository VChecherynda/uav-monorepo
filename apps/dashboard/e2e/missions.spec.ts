import { expect, request, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.describe('assign', () => {
  test.afterEach(async () => {
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
      await api.post('/missions/m0/unassign', { data: { droneId: 'owl-3' } }),
    ).toBeOK();

    await api.dispose();
  });

  test('user assigns drone to mission', async ({ page }) => {
    await page.goto('/');

    const missionsButton = page.getByRole('button', { name: 'Missions' });
    await missionsButton.click();

    const missionCard = page
      .locator('.card')
      .filter({ hasText: 'Recon sector 1' });

    const droneSelect = missionCard.getByRole('combobox');
    await droneSelect.selectOption('owl-3');

    const assignButton = missionCard.getByRole('button', {
      name: 'ASSIGN',
      exact: true,
    });
    await assignButton.click();

    await expect(missionCard.getByText('Owl-3')).toBeVisible();
  });
});

test.describe('unit boundary', () => {
  test.use({ storageState: 'e2e/.auth/reserve-commander.json' });

  test("reserve commander sees only own unit's missions", async ({ page }) => {
    await page.goto('/');

    const missionsButton = page.getByRole('button', { name: 'Missions' });
    await missionsButton.click();

    const reserveMissionCard = page
      .locator('.card')
      .filter({ hasText: 'Destroy warehouse sector 3' });

    const trainingMissionCard = page
      .locator('.card')
      .filter({ hasText: 'Recon sector 1' });

    await expect(reserveMissionCard).toBeVisible();
    await expect(trainingMissionCard).toHaveCount(0);
  });
});

test('user starts mission and sees it in progress', async ({ page }) => {
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
