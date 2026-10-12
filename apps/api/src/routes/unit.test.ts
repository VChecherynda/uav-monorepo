import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: { unitMember: { findUnique: vi.fn().mockResolvedValue(null) } },
}));

describe('unit invitations routes', () => {
  it('returns 401 without unit member', async () => {
    const app = await buildApp();
    const token = jwt.sign({ userId: 'ghost' }, config.jwtSecret);

    const res = await app.inject({
      method: 'POST',
      url: '/unit/invitations',
      headers: { authorization: `Bearer ${token}` },
      payload: { unitRole: 'OPERATOR' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Unit member not found');

    await app.close();
  });
});
