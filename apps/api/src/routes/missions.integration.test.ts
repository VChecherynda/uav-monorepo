import { afterAll, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp, type AppInstance } from '../app.js';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';
import { prisma } from '../lib/prisma.js';
import type { Mission } from '@uav/shared';

let app: AppInstance;

beforeEach(async () => {
  app = await buildApp();
});

afterEach(async () => {
  await app.close();
});

it("excludes another unit's missions", async () => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: 'reserve.commander@uav.test.com' },
  });

  const token = jwt.sign({ userId: user.id }, config.jwtSecret);

  const res = await app.inject({
    method: 'GET',
    url: '/missions',
    headers: { authorization: `Bearer ${token}` },
  });

  expect(res.statusCode).toBe(200);
  const ids = res.json<Mission[]>().map((m) => m.id);
  expect(ids).toEqual(['m5']);
});

it("returns own unit's missions", async () => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: 'demo@uav.test' },
  });

  const token = jwt.sign({ userId: user.id }, config.jwtSecret);

  const res = await app.inject({
    method: 'GET',
    url: '/missions',
    headers: { authorization: `Bearer ${token}` },
  });

  expect(res.statusCode).toBe(200);

  const ids = res.json<Mission[]>().map((m) => m.id);
  expect(ids).toContain('m0');
});

afterAll(() => prisma.$disconnect());
