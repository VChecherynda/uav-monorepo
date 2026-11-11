import { request } from '@playwright/test';
import { readFileSync } from 'node:fs';

export async function buildAuthenticatedApi(path: string) {
  const storageState = JSON.parse(readFileSync(path, 'utf-8'));
  const rawAuth = storageState.origins[0].localStorage[0].value;
  const authStore = JSON.parse(rawAuth);

  return await request.newContext({
    baseURL: 'http://localhost:4000',
    extraHTTPHeaders: { Authorization: `Bearer ${authStore.state.token}` },
  });
}
