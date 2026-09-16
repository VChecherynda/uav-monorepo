import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mapMission, mapDrone, type MissionWithWaypoints } from './mappers.js';
import type { Drone as PrismaDrone } from '@prisma/client';

const CREATED_AT = new Date('2026-09-15T12:00:00Z');

const buildMissionRow = (
  fields?: Partial<MissionWithWaypoints>,
): MissionWithWaypoints => {
  const defaultMission = {
    name: 'Prisma Mission',
    id: 'M1',
    status: 'draft',
    reason: null,
    createdAt: CREATED_AT,
    waypoints: [],
  };

  return {
    ...defaultMission,
    ...fields,
  };
};

const UPDATED_AT = new Date('2026-09-16T12:00:00Z');

const buildDroneRow = (fields?: Partial<PrismaDrone>): PrismaDrone => {
  const defaultDrone = {
    name: 'Prisma Drone',
    id: 'D1',
    missionId: null,
    flightPhase: 'ON_GROUND' as const,
    flightMode: 'LOITER' as const,
    disposition: 'ACTIVE' as const,
    lng: 133,
    lat: -20,
    battery: 80,
    altitude: 100,
    homeLng: 133,
    homeLat: -25,
    updatedAt: UPDATED_AT,
    createdAt: CREATED_AT,
  };

  return {
    ...defaultDrone,
    ...fields,
  };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('throws error when mapping a mission row with unknown status', () => {
  expect(() => mapMission(buildMissionRow({ status: 'draftt' }))).toThrow();
});

it('drops db-only fields from mission payload', () => {
  expect(mapMission(buildMissionRow())).toEqual({
    id: 'M1',
    name: 'Prisma Mission',
    status: 'draft',
    waypoints: [],
    reason: null,
  });
});

it.each([
  [buildDroneRow({ flightPhase: 'FLYING' } as never)],
  [buildDroneRow({ flightMode: 'MANUAL' } as never)],
  [buildDroneRow({ disposition: 'LOST' } as never)],
])('throws error when mapping a drone row with unknown fields', (droneRow) => {
  expect(() => mapDrone(droneRow)).toThrow();
});

it('drops db-only fields from drone payload', () => {
  vi.setSystemTime(UPDATED_AT);

  expect(mapDrone(buildDroneRow())).toStrictEqual({
    id: 'D1',
    missionId: null,
    name: 'Prisma Drone',
    flightPhase: 'ON_GROUND',
    flightMode: 'LOITER',
    disposition: 'ACTIVE',
    link: 'ONLINE',
    battery: 80,
    altitude: 100,
    lng: 133,
    lat: -20,
  });
});

it('marks drone ONLINE', () => {
  vi.setSystemTime(UPDATED_AT.getTime() + 6000);

  expect(mapDrone(buildDroneRow()).link).toBe('ONLINE');
});

it('marks drone OFFLINE after 6000 ms of silence', () => {
  vi.setSystemTime(UPDATED_AT.getTime() + 6001);

  expect(mapDrone(buildDroneRow()).link).toBe('OFFLINE');
});
