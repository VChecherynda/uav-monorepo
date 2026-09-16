import { describe, it, expect } from 'vitest';
import { type Drone, resolveRejection, nextPhaseAndMode } from './drone.js';

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

describe('resolveRejection', () => {
  it('rejects offline drone', () => {
    const drone = buildDrone({ link: 'OFFLINE' });©

    expect(resolveRejection(drone, 'takeoff')).toEqual({
      code: 'DRONE_OFFLINE',
      message: `Drone ${drone.name} is offline`,
    });
  });

  it('rejects return home when drone already going home', () => {
    const drone = buildDrone({ flightPhase: 'IN_AIR', flightMode: 'RTL' });

    expect(resolveRejection(drone, 'return-home')).toEqual({
      code: 'ALREADY_IN_MODE',
      message: 'Already returning home',
    });
  });

  it('rejects hold when drone already holding', () => {
    const drone = buildDrone({ flightPhase: 'IN_AIR', flightMode: 'LOITER' });

    expect(resolveRejection(drone, 'hold')).toEqual({
      code: 'ALREADY_IN_MODE',
      message: 'Already holding',
    });
  });

  it.each([
    [
      buildDrone({ flightPhase: 'ON_GROUND' }),
      'land' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot land while ON_GROUND',
      },
    ],
    [
      buildDrone({ flightPhase: 'ON_GROUND' }),
      'return-home' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot return-home while ON_GROUND',
      },
    ],
    [
      buildDrone({ flightPhase: 'ON_GROUND' }),
      'hold' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot hold while ON_GROUND',
      },
    ],
    [
      buildDrone({ flightPhase: 'TAKEOFF' }),
      'takeoff' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot takeoff while TAKEOFF',
      },
    ],
    [
      buildDrone({ flightPhase: 'TAKEOFF' }),
      'hold' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot hold while TAKEOFF',
      },
    ],
    [
      buildDrone({ flightPhase: 'IN_AIR' }),
      'takeoff' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot takeoff while IN_AIR',
      },
    ],
    [
      buildDrone({ flightPhase: 'LANDING' }),
      'takeoff' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot takeoff while LANDING',
      },
    ],
    [
      buildDrone({ flightPhase: 'LANDING' }),
      'land' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot land while LANDING',
      },
    ],
    [
      buildDrone({ flightPhase: 'LANDING' }),
      'return-home' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot return-home while LANDING',
      },
    ],
    [
      buildDrone({ flightPhase: 'LANDING' }),
      'hold' as const,
      {
        code: 'INVALID_TRANSITION',
        message: 'Cannot hold while LANDING',
      },
    ],
  ])('rejects %s in %s', (drone, action, result) => {
    expect(resolveRejection(drone, action)).toEqual(result);
  });

  it.each([
    [buildDrone({ flightPhase: 'ON_GROUND' }), 'takeoff' as const],
    [buildDrone({ flightPhase: 'TAKEOFF' }), 'land' as const],
    [buildDrone({ flightPhase: 'TAKEOFF' }), 'return-home' as const],
    [buildDrone({ flightPhase: 'IN_AIR' }), 'land' as const],
    [
      buildDrone({ flightPhase: 'IN_AIR', flightMode: 'AUTO' }),
      'hold' as const,
    ],
    [buildDrone({ flightPhase: 'IN_AIR' }), 'return-home' as const],
  ])('finds no rejection for %s in %s  ', (drone, action) => {
    expect(resolveRejection(drone, action)).toBeUndefined();
  });
});

describe('nextPhaseAndMode', () => {
  it.each([
    [
      buildDrone({ missionId: null }),
      'takeoff' as const,
      {
        flightPhase: 'TAKEOFF',
        flightMode: 'LOITER',
      },
    ],
    [
      buildDrone({ missionId: 'm1' }),
      'takeoff' as const,
      {
        flightPhase: 'TAKEOFF',
        flightMode: 'AUTO',
      },
    ],
    [
      buildDrone({ missionId: 'm1' }),
      'land' as const,
      {
        flightPhase: 'LANDING',
        flightMode: 'LAND',
      },
    ],
    [
      buildDrone({ flightPhase: 'TAKEOFF' }),
      'return-home' as const,
      {
        flightPhase: 'TAKEOFF',
        flightMode: 'RTL',
      },
    ],
    [
      buildDrone({ flightPhase: 'IN_AIR' }),
      'return-home' as const,
      {
        flightPhase: 'IN_AIR',
        flightMode: 'RTL',
      },
    ],
    [
      buildDrone({ flightPhase: 'IN_AIR' }),
      'hold' as const,
      {
        flightPhase: 'IN_AIR',
        flightMode: 'LOITER',
      },
    ],
  ])(
    'get floightPhase and floightPhase for drone',
    (drone, action, expected) => {
      expect(nextPhaseAndMode(drone, action)).toEqual(expected);
    },
  );
});
