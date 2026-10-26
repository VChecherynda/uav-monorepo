import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import type { UnitMember } from '@prisma/client';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    unitMember: {
      findUnique: vi.fn(),
    },
  },
}));

describe('auth me route', () => {
  it('returns 401 token invalid or expired', async () => {
    const app = await buildApp();
    const token = null;

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Invalid or expired token');

    await app.close();
  });

  it('returns 401 when unitMember not found', async () => {
    const app = await buildApp();
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce(null);

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Unit member not found');

    await app.close();
  });

  it('returns unitMember unitId and unitRole fields', async () => {
    const app = await buildApp();
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
      unitId: 'u1',
      unitRole: 'OPERATOR',
    } as UnitMember);

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      unitId: 'u1',
      unitRole: 'OPERATOR',
    });

    await app.close();
  });
});
