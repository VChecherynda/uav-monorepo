import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp, type AppInstance } from '../app.js';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import type { Drone, UnitMember } from '@prisma/client';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    drone: {
      findUnique: vi.fn(),
    },
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

describe('drone telemetry route', () => {
  it('returns 404 when drone belongs to another unit', async () => {
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.drone.findUnique).mockResolvedValueOnce({
      unitId: 'u1',
    } as Drone);

    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
      unitId: 'u2',
      unitRole: 'OPERATOR',
    } as UnitMember);

    const res = await app.inject({
      method: 'GET',
      url: '/drones/d1/telemetry',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().reason.code).toBe('DRONE_NOT_FOUND');
  });

  it('returns 404 for unknown drone id', async () => {
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.drone.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
      unitId: 'u2',
      unitRole: 'OPERATOR',
    } as UnitMember);

    const res = await app.inject({
      method: 'GET',
      url: '/drones/d1/telemetry',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().reason.code).toBe('DRONE_NOT_FOUND');
  });
});

describe('drone command route', () => {
  it('returns 404 when drone belongs to another unit', async () => {
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.drone.findUnique).mockResolvedValueOnce({
      unitId: 'u1',
    } as Drone);

    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
      unitId: 'u2',
      unitRole: 'OPERATOR',
    } as UnitMember);

    const res = await app.inject({
      method: 'POST',
      url: '/drones/d1/command',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        action: 'return-home',
      },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().reason.code).toBe('DRONE_NOT_FOUND');
  });

  it('returns 404 for unknown drone id', async () => {
    const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

    vi.mocked(prisma.drone.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
      unitId: 'u2',
      unitRole: 'OPERATOR',
    } as UnitMember);

    const res = await app.inject({
      method: 'POST',
      url: '/drones/d1/command',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        action: 'return-home',
      },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().reason.code).toBe('DRONE_NOT_FOUND');
  });
});
