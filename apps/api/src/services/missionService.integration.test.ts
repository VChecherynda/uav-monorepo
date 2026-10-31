import { beforeEach, afterEach, afterAll, it, expect } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { startMissionService } from './missionService.js';
import type { Actor } from '../domain/actor.js';
import type { Drone } from '@prisma/client';

let actor: Actor;
let drone: Drone;

beforeEach(async () => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: 'demo@uav.test' },
  });

  const unitMember = await prisma.unitMember.findUniqueOrThrow({
    where: { userId: user.id },
  });

  actor = {
    userId: user.id,
    unitId: unitMember.unitId,
    unitRole: unitMember.unitRole,
  };

  const mission = await prisma.mission.create({
    data: {
      id: 'race-m',
      status: 'draft',
      name: 'Race mission 1',
      unitId: unitMember.unitId,
      authorId: unitMember.userId,
    },
  });

  await prisma.waypoint.create({
    data: {
      lng: 8,
      lat: 12,
      missionId: mission.id,
      order: 0,
    },
  });

  drone = await prisma.drone.findFirstOrThrow({
    where: { name: 'Owl-3' },
  });

  await prisma.drone.update({
    where: { id: drone.id },
    data: {
      missionId: mission.id,
    },
  });
});

afterEach(async () => {
  await prisma.waypoint.deleteMany({ where: { missionId: 'race-m' } });
  await prisma.drone.update({
    where: { id: drone.id },
    data: {
      missionId: null,
    },
  });
  await prisma.mission.delete({ where: { id: 'race-m' } });
});

it('allows 1 success of 2 concurrent starts', async () => {
  const results = await Promise.all([
    startMissionService('race-m', actor),
    startMissionService('race-m', actor),
  ]);

  expect(results.map((r) => r.status).sort()).toEqual(['rejected', 'success']);

  const mission = await prisma.mission.findUniqueOrThrow({
    where: { id: 'race-m' },
  });

  expect(mission.status).toBe('in-progress');
});

afterAll(() => prisma.$disconnect());
