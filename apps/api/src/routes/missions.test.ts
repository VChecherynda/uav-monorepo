import { vi, it, beforeEach, afterEach, expect } from 'vitest';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { startMissionService } from '../services/missionService.js';
import type { UnitMember } from '@prisma/client';
import { buildApp, type AppInstance } from '../app.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    unitMember: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../services/missionService.js', () => ({
  startMissionService: vi.fn(),
}));

let app: AppInstance;

beforeEach(async () => {
  app = await buildApp();
});

afterEach(async () => {
  await app.close();
});

it("returns 404 for another unit's mission", async () => {
  const token = jwt.sign({ userId: 'user1' }, config.jwtSecret);

  vi.mocked(prisma.unitMember.findUnique).mockResolvedValueOnce({
    unitId: 'u1',
    unitRole: 'COMMANDER',
  } as UnitMember);

  vi.mocked(startMissionService).mockResolvedValueOnce({
    status: 'rejected',
    reason: {
      code: 'MISSION_NOT_FOUND',
      message: 'Mission not found',
    },
  });

  const res = await app.inject({
    method: 'POST',
    url: '/missions/m0/start',
    headers: { authorization: `Bearer ${token}` },
  });

  expect(res.statusCode).toBe(404);
});
