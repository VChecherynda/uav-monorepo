import { afterAll, it, expect } from 'vitest';
import { prisma } from '../lib/prisma.js';

it('reads seeded units', async () => {
  expect(await prisma.unit.count()).toBeGreaterThan(0);
});

afterAll(() => prisma.$disconnect());
