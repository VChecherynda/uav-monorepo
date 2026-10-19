import { describe, it, expect } from 'vitest';
import {
  assignDrone,
  abortMission,
  startMission,
  completeMission,
  canReplaceWaypoints,
  restoreMission,
  unassignDrone,
  terminateMission,
  resolveUnitRejection,
} from '../domain/mission.js';
import type { Drone, Mission } from '@uav/shared';
import type { Actor } from './actor.js';

const defaultWaypoints = [
  { lng: 8, lat: 12 },
  { lng: 12, lat: 22 },
  { lng: 33, lat: 30 },
  { lng: 38, lat: 30 },
];

const noFlyZone1 = {
  id: 'id_1',
  name: 'Alpha',
  area: [
    { lng: 10, lat: 5 },
    { lng: 20, lat: 5 },
    { lng: 20, lat: 15 },
    { lng: 10, lat: 15 },
  ],
};

const noFlyZone2 = {
  id: 'id_2',
  name: 'Bravo',
  area: [
    { lng: 30, lat: 15 },
    { lng: 40, lat: 15 },
    { lng: 40, lat: 25 },
    { lng: 30, lat: 25 },
  ],
};

const actor: Actor = {
  userId: 'user-1',
  unitId: 'unit-1',
  unitRole: 'COMMANDER',
};

const buildMission = (fields?: Partial<Mission>): Mission => {
  const defaultMission: Mission = {
    id: 'm1',
    name: 'test_name',
    waypoints: defaultWaypoints,
    status: 'draft' as const,
    unitId: 'unit-1',
    authorId: 'user-1',
    reason: null,
  };

  return {
    ...defaultMission,
    ...fields,
  };
};

const buildDrone = (fields?: Partial<Drone>): Drone => {
  const defaultDrone: Drone = {
    id: 'd1',
    name: 'test_d1',
    missionId: null,
    flightPhase: 'ON_GROUND',
    flightMode: 'LOITER',
    disposition: 'ACTIVE',
    link: 'ONLINE',
    altitude: 0,
    lng: 8,
    lat: 12,
    battery: 80,
  };

  return {
    ...defaultDrone,
    ...fields,
  };
};

describe('assignDrone', () => {
  it('assigns an idle to the a draft mission', () => {
    expect(
      assignDrone({ status: 'draft', unitId: 'unit-1' }, buildDrone(), actor),
    ).toEqual({
      status: 'success',
    });
  });

  it.each([
    [
      { status: 'draft', unitId: 'unit-1' } as const,
      buildDrone({
        flightPhase: 'IN_AIR',
        flightMode: 'AUTO',
        missionId: 'm1',
      }),
      { code: 'DRONE_IS_NOT_READY', message: 'Drone is on another mission' },
    ],
    [
      { status: 'draft', unitId: 'unit-1' } as const,
      buildDrone({
        disposition: 'EXPENDED',
      }),
      { code: 'DRONE_IS_NOT_READY', message: 'Drone is expended' },
    ],
    [
      { status: 'in-progress', unitId: 'unit-1' } as const,
      buildDrone(),
      {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can be assigned',
      },
    ],
  ])('rejects with reason: %s', (mission, drone, reason) => {
    expect(assignDrone(mission, drone, actor)).toEqual({
      status: 'rejected',
      reason,
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      assignDrone(
        buildMission({
          status: 'draft',
          unitId: 'unit-2',
        }),
        buildDrone(),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('unassignDrone', () => {
  it('unassigns mission succesfully', () => {
    expect(
      unassignDrone(
        { id: 'm1', unitId: 'unit-1', status: 'draft' },
        buildDrone({ missionId: 'm1' }),
        actor,
      ),
    ).toEqual({
      status: 'success',
    });
  });

  it.each([
    [
      { id: 'm1', unitId: 'unit-1', status: 'draft' } as const,
      buildDrone({ missionId: 'm1', disposition: 'EXPENDED' }),
      {
        code: 'DRONE_IS_NOT_READY',
        message: 'Drone is expended',
      },
    ],
    [
      { id: 'm1', unitId: 'unit-1', status: 'in-progress' } as const,
      buildDrone({ missionId: 'm1' }),
      {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can be unassigned',
      },
    ],
    [
      { id: 'm1', unitId: 'unit-1', status: 'draft' } as const,
      buildDrone({ missionId: 'm2' }),
      {
        code: 'DRONE_IS_NOT_ON_MISSION',
        message: 'Drone is not on this mission',
      },
    ],
  ])('rejects with reason: %s', (mission, drone, reason) => {
    expect(unassignDrone(mission, drone, actor)).toEqual({
      status: 'rejected',
      reason,
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      unassignDrone(
        buildMission({
          id: 'm1',
          status: 'draft',
          unitId: 'unit-2',
        }),
        buildDrone({ missionId: 'm1' }),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('canReplaceWaypoints', () => {
  it('can replace mission waypoints', () => {
    expect(canReplaceWaypoints(buildMission())).toEqual({
      status: 'success',
    });
  });

  it.each([
    [buildMission({ status: 'in-progress' })],
    [buildMission({ status: 'completed' })],
    [buildMission({ status: 'aborted' })],
    [buildMission({ status: 'terminated' })],
  ])('rejects waypoint replacement for locked mission %s', (mission) => {
    expect(canReplaceWaypoints(mission)).toEqual({
      status: 'rejected',
      reason: {
        code: 'WAYPOINTS_CANNOT_BE_REPLACED',
        message: 'Waypoints can only be replaced while mission is draft',
      },
    });
  });
});

describe('startMission', () => {
  it('mission is started successfully', () => {
    expect(
      startMission(
        buildMission(),
        [buildDrone()],
        [noFlyZone1, noFlyZone2],
        actor,
      ),
    ).toEqual({
      status: 'success',
      mission: { status: 'in-progress' },
    });
  });

  it.each([
    [
      buildMission(),
      [],
      {
        code: 'MISSION_HAS_NO_DRONE',
        message: 'Mission has no assigned drone',
      },
    ],
    [
      buildMission({ status: 'in-progress' }),
      [buildDrone()],
      {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can start',
      },
    ],
    [
      buildMission({ waypoints: [] }),
      [buildDrone()],
      {
        code: 'MISSION_HAS_NO_WAYPOINTS',
        message: 'Mission should have waypoints',
      },
    ],
    [
      buildMission({
        waypoints: [
          { lng: 15, lat: 12 },
          { lng: 23, lat: 30 },
          { lng: 38, lat: 30 },
        ],
      }),
      [buildDrone()],
      {
        code: 'ROUTE_VIOLATES_ZONE',
        message:
          'Waypoint 1 is inside zone Alpha; Segment 1 crosses zone Alpha; Segment 2 crosses zone Alpha',
        violations: [
          { kind: 'waypoint', index: 0, zoneId: 'id_1' },
          { kind: 'segment', index: 0, zoneId: 'id_1' },
          { kind: 'segment', index: 1, zoneId: 'id_1' },
        ],
      },
    ],
    [
      buildMission({
        waypoints: [
          { lng: 12, lat: 22 },
          { lng: 37, lat: 22 },
          { lng: 38, lat: 30 },
        ],
      }),
      [buildDrone()],
      {
        code: 'ROUTE_VIOLATES_ZONE',
        message:
          'Waypoint 2 is inside zone Bravo; Segment 2 crosses zone Bravo; Segment 3 crosses zone Bravo',
        violations: [
          { kind: 'waypoint', index: 1, zoneId: 'id_2' },
          { kind: 'segment', index: 1, zoneId: 'id_2' },
          { kind: 'segment', index: 2, zoneId: 'id_2' },
        ],
      },
    ],
    [
      buildMission({
        waypoints: [
          { lng: 12, lat: 22 },
          { lng: 45, lat: 22 },
          { lng: 50, lat: 30 },
        ],
      }),
      [buildDrone()],
      {
        code: 'ROUTE_VIOLATES_ZONE',
        message: 'Segment 2 crosses zone Bravo',
        violations: [{ kind: 'segment', index: 1, zoneId: 'id_2' }],
      },
    ],
    [
      buildMission({
        waypoints: [
          { lng: 23, lat: 12 },
          { lng: 23, lat: 30 },
          { lng: 38, lat: 30 },
        ],
      }),
      [buildDrone()],
      {
        code: 'ROUTE_VIOLATES_ZONE',
        message: 'Segment 1 crosses zone Alpha',
        violations: [{ kind: 'segment', index: 0, zoneId: 'id_1' }],
      },
    ],
  ])('rejects with reason: %s', (mission, drones, reason) => {
    expect(
      startMission(mission, drones, [noFlyZone1, noFlyZone2], actor),
    ).toEqual({
      status: 'rejected',
      reason,
    });
  });
});

describe('abortMission', () => {
  it('mission with in-progress status aborted successfuly', () => {
    expect(
      abortMission(buildMission({ status: 'in-progress' }), actor),
    ).toEqual({
      status: 'success',
      mission: { status: 'aborted' },
    });
  });

  it.each([
    [buildMission({ status: 'draft' }), 'draft'],
    [buildMission({ status: 'completed' }), 'completed'],
    [buildMission({ status: 'aborted' }), 'aborted'],
    [buildMission({ status: 'terminated' }), 'terminated'],
  ])('rejects with status %s', (mission, status) => {
    expect(abortMission(mission, actor)).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_ABORTED',
        message: `Cannot abort mission in status "${status}"`,
      },
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      abortMission(
        buildMission({
          status: 'in-progress',
          unitId: 'unit-2',
        }),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('terminateMission', () => {
  it('mission with aborted status terminated succesfully', () => {
    expect(
      terminateMission(buildMission({ status: 'aborted' }), actor),
    ).toEqual({
      status: 'success',
      mission: {
        status: 'terminated',
      },
    });
  });

  it.each([
    [buildMission({ status: 'draft' })],
    [buildMission({ status: 'in-progress' })],
    [buildMission({ status: 'completed' })],
    [buildMission({ status: 'terminated' })],
  ])('rejects with status %s', (mission) => {
    expect(terminateMission(mission, actor)).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_TERMINATED',
        message: 'Only aborted missions can be terminated',
      },
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      terminateMission(
        buildMission({
          status: 'aborted',
          unitId: 'unit-2',
        }),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('completeMission', () => {
  it('mission with in-progress status completed successfuly', () => {
    expect(
      completeMission(buildMission({ status: 'in-progress' }), actor),
    ).toEqual({
      status: 'success',
      mission: { status: 'completed' },
    });
  });

  it.each([
    [buildMission({ status: 'draft' })],
    [buildMission({ status: 'completed' })],
    [buildMission({ status: 'aborted' })],
    [buildMission({ status: 'terminated' })],
  ])('rejects with status %s', (mission) => {
    expect(completeMission(mission, actor)).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_IS_NOT_IN_PROGRESS',
        message: 'Only in-progress missions can be completed',
      },
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      completeMission(
        buildMission({
          status: 'in-progress',
          unitId: 'unit-2',
        }),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('restoreMission', () => {
  it('mission with aborted status reassigned successfuly', () => {
    expect(restoreMission(buildMission({ status: 'aborted' }), actor)).toEqual({
      status: 'success',
      mission: {
        status: 'draft',
      },
    });
  });

  it.each([
    [buildMission({ status: 'draft' })],
    [buildMission({ status: 'in-progress' })],
    [buildMission({ status: 'completed' })],
    [buildMission({ status: 'terminated' })],
  ])('rejects to restore mission with status %s', (mission) => {
    expect(restoreMission(mission, actor)).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_RESTORED',
        message: 'Only aborted missions can be restored',
      },
    });
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      restoreMission(
        buildMission({
          status: 'aborted',
          unitId: 'unit-2',
        }),
        actor,
      ),
    ).toEqual({
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    });
  });
});

describe('resolveUnitRejection', () => {
  it('passes own unit', () => {
    expect(resolveUnitRejection(buildMission(), actor)).toBeUndefined();
  });

  it('rejects another unit with MISSION_NOT_FOUND', () => {
    expect(
      resolveUnitRejection(
        buildMission({
          unitId: 'unit-2',
        }),
        actor,
      ),
    ).toEqual({
      code: 'MISSION_NOT_FOUND',
      message: 'Mission not found',
    });
  });
});
