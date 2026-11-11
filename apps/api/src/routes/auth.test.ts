import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp, type AppInstance } from '../app.js';
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

let app: AppInstance;

beforeEach(async () => {
  app = await buildApp();
});

afterEach(async () => {
  await app.close();
});

describe('auth me route', () => {
  it('returns 401 token invalid or expired', async () => {
    const token = null;

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Invalid or expired token');
  });

  it('returns 401 when unitMember not found', async () => {
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce(null);

    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('Unit member not found');
  });

  it('returns unitMember unitId and unitRole fields', async () => {
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
  });
});
