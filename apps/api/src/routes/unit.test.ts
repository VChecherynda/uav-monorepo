import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp, type AppInstance } from '../app.js';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: { unitMember: { findUnique: vi.fn().mockResolvedValue(null) } },
}));

let app: AppInstance;

beforeEach(async () => {
  app = await buildApp();
});

afterEach(async () => {
  await app.close();
});

describe('unit invitations routes', () => {
  it('returns 401 without unit member', async () => {
    const token = jwt.sign({ userId: 'ghost' }, config.jwtSecret);

    const res = await app.inject({
      method: 'POST',
      url: '/unit/invitations',
      headers: { authorization: `Bearer ${token}` },
      payload: { unitRole: 'OPERATOR' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Unit member not found');
  });
});
