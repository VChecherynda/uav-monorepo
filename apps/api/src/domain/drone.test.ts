import { describe, it, expect } from 'vitest';
import { executeCommand } from './drone.js';
import type { Drone, FlightMode, FlightPhase } from '@uav/shared';

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

const buildSuccessPatch = ({
  flightPhase,
  flightMode,
}: {
  flightPhase: FlightPhase;
  flightMode: FlightMode;
}): { status: 'success'; drone: Pick<Drone, 'flightPhase' | 'flightMode'> } => {
  return {
    status: 'success',
    drone: { flightPhase, flightMode },
  };
};

describe('executeCommand', () => {
  describe('returns success patch for valid commands', () => {
    it.each([
      [
        buildDrone({ flightPhase: 'IN_AIR', flightMode: 'AUTO' }),
        'return-home',
        buildSuccessPatch({ flightPhase: 'IN_AIR', flightMode: 'RTL' }),
      ],
      [
        buildDrone({ flightPhase: 'IN_AIR', flightMode: 'AUTO' }),
        'land',
        buildSuccessPatch({
          flightPhase: 'LANDING',
          flightMode: 'LAND',
        }),
      ],
      [
        buildDrone(),
        'takeoff',
        buildSuccessPatch({ flightPhase: 'TAKEOFF', flightMode: 'LOITER' }),
      ],
      [
        buildDrone({ missionId: 'm1' }),
        'takeoff',
        buildSuccessPatch({ flightPhase: 'TAKEOFF', flightMode: 'AUTO' }),
      ],
      [
        buildDrone({ flightPhase: 'TAKEOFF' }),
        'land',
        buildSuccessPatch({ flightPhase: 'LANDING', flightMode: 'LAND' }),
      ],
      [
        buildDrone({ flightPhase: 'TAKEOFF' }),
        'return-home',
        buildSuccessPatch({ flightPhase: 'TAKEOFF', flightMode: 'RTL' }),
      ],
      [
        buildDrone({ flightPhase: 'IN_AIR', flightMode: 'AUTO' }),
        'hold',
        buildSuccessPatch({ flightPhase: 'IN_AIR', flightMode: 'LOITER' }),
      ],
    ] as const)(
      'case %#: executeCommand returns correct patch',
      (drone, action, result) => {
        expect(executeCommand(drone, action)).toEqual(result);
      },
    );
  });

  describe('rejects invalid commands', () => {
    it('rejects offline drone', () => {
      const drone = buildDrone({ link: 'OFFLINE' });

      const result = executeCommand(drone, 'takeoff');
      expect(result).toEqual({
        status: 'rejected',
        reason: {
          code: 'DRONE_OFFLINE',
          message: `Drone ${drone.name} is offline`,
        },
      });
    });

    it('rejects return home when drone already going home', () => {
      const result = executeCommand(
        buildDrone({ flightPhase: 'IN_AIR', flightMode: 'RTL' }),
        'return-home',
      );

      expect(result).toEqual({
        status: 'rejected',
        reason: {
          code: 'ALREADY_IN_MODE',
          message: 'Already returning home',
        },
      });
    });

    it('rejects hold when drone already holding', () => {
      const result = executeCommand(
        buildDrone({ flightPhase: 'IN_AIR', flightMode: 'LOITER' }),
        'hold',
      );

      expect(result).toEqual({
        status: 'rejected',
        reason: {
          code: 'ALREADY_IN_MODE',
          message: 'Already holding',
        },
      });
    });

    it.each([
      [
        buildDrone(),
        'return-home',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot return-home while ON_GROUND',
          },
        },
      ],
      [
        buildDrone(),
        'land',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot land while ON_GROUND',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'TAKEOFF' }),
        'hold',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot hold while TAKEOFF',
          },
        },
      ],
      [
        buildDrone(),
        'hold',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot hold while ON_GROUND',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'TAKEOFF' }),
        'takeoff',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot takeoff while TAKEOFF',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'IN_AIR' }),
        'takeoff',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot takeoff while IN_AIR',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'LANDING', flightMode: 'LAND' }),
        'takeoff',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot takeoff while LANDING',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'LANDING', flightMode: 'LAND' }),
        'land',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot land while LANDING',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'LANDING', flightMode: 'LAND' }),
        'return-home',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot return-home while LANDING',
          },
        },
      ],
      [
        buildDrone({ flightPhase: 'LANDING', flightMode: 'LAND' }),
        'hold',
        {
          status: 'rejected',
          reason: {
            code: 'INVALID_TRANSITION',
            message: 'Cannot hold while LANDING',
          },
        },
      ],
    ] as const)(
      'case %#: executeCommand rejects invalid transition',
      (drone, action, result) => {
        expect(executeCommand(drone, action)).toEqual(result);
      },
    );

    it('rejects low battery', () => {
      const LOW_BATTERY_CHARGE = 19;
      const drone = buildDrone({ battery: LOW_BATTERY_CHARGE });

      const result = executeCommand(drone, 'takeoff');
      expect(result).toEqual({
        status: 'rejected',
        reason: {
          code: 'INSUFFICIENT_BATTERY',
          message: `Insufficient battery: ${LOW_BATTERY_CHARGE}%`,
        },
      });
    });
  });
});
