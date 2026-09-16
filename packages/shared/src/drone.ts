import { z } from 'zod';

export const DroneActionSchema = z.enum([
  'return-home',
  'land',
  'takeoff',
  'hold',
]);

export type DroneAction = z.infer<typeof DroneActionSchema>;

export const FlightPhaseSchema = z.enum([
  'ON_GROUND',
  'TAKEOFF',
  'IN_AIR',
  'LANDING',
]);

export type FlightPhase = z.infer<typeof FlightPhaseSchema>;

export const FlightModeSchema = z.enum(['AUTO', 'RTL', 'LAND', 'LOITER']);

export type FlightMode = z.infer<typeof FlightModeSchema>;

export const LinkStateSchema = z.enum(['ONLINE', 'OFFLINE']);

export type LinkState = z.infer<typeof LinkStateSchema>;

export const DispositionSchema = z.enum(['ACTIVE', 'EXPENDED']);

export type Disposition = z.infer<typeof DispositionSchema>;

export const DroneSchema = z.object({
  id: z.string(),
  missionId: z.string().nullable(),
  name: z.string(),
  flightPhase: FlightPhaseSchema,
  flightMode: FlightModeSchema,
  disposition: DispositionSchema,
  link: LinkStateSchema,
  battery: z.number(),
  altitude: z.number(),
  lng: z.number(),
  lat: z.number(),
});

export type Drone = z.infer<typeof DroneSchema>;

const buildReason = <C extends string>(code: C) => {
  return z.object({
    code: z.literal(code),
    message: z.string(),
  });
};

export const DroneCommandConflictReasonSchema = z.discriminatedUnion('code', [
  buildReason('DRONE_OFFLINE'),
  buildReason('INSUFFICIENT_BATTERY'),
  buildReason('INVALID_TRANSITION'),
  buildReason('ALREADY_IN_MODE'),
]);

export type DroneCommandConflictReason = z.infer<
  typeof DroneCommandConflictReasonSchema
>;

const AVAILABLE_ACTIONS: Record<FlightPhase, DroneAction[]> = {
  ON_GROUND: ['takeoff'],
  TAKEOFF: ['land', 'return-home'],
  IN_AIR: ['land', 'return-home', 'hold'],
  LANDING: [],
};

export function resolveRejection(
  drone: Drone,
  action: DroneAction,
): DroneCommandConflictReason | undefined {
  if (drone.link === 'OFFLINE') {
    return { code: 'DRONE_OFFLINE', message: `Drone ${drone.name} is offline` };
  }

  if (
    drone.flightPhase === 'IN_AIR' &&
    drone.flightMode === 'RTL' &&
    action === 'return-home'
  ) {
    return { code: 'ALREADY_IN_MODE', message: 'Already returning home' };
  }

  if (
    drone.flightPhase === 'IN_AIR' &&
    drone.flightMode === 'LOITER' &&
    action === 'hold'
  ) {
    return {
      code: 'ALREADY_IN_MODE',
      message: 'Already holding',
    };
  }

  if (!AVAILABLE_ACTIONS[drone.flightPhase].includes(action)) {
    return {
      code: 'INVALID_TRANSITION',
      message: `Cannot ${action} while ${drone.flightPhase}`,
    };
  }

  return;
}

export function nextPhaseAndMode(
  drone: Drone,
  action: DroneAction,
): Pick<Drone, 'flightPhase' | 'flightMode'> {
  switch (action) {
    case 'takeoff':
      return {
        flightPhase: 'TAKEOFF',
        flightMode: drone.missionId ? 'AUTO' : 'LOITER',
      };
    case 'land':
      return {
        flightPhase: 'LANDING',
        flightMode: 'LAND',
      };
    case 'return-home':
      return {
        flightPhase: drone.flightPhase,
        flightMode: 'RTL',
      };
    case 'hold':
      return {
        flightPhase: drone.flightPhase,
        flightMode: 'LOITER',
      };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
