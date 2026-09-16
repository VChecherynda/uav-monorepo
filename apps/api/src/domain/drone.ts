import type {
  Drone,
  DroneAction,
  DroneCommandConflictReason,
} from '@uav/shared';
import { resolveRejection, nextPhaseAndMode } from '@uav/shared';

export const executeCommand = (
  drone: Drone,
  action: DroneAction,
):
  | { status: 'success'; drone: Partial<Drone> }
  | { status: 'rejected'; reason: DroneCommandConflictReason } => {
  const reason = resolveRejection(drone, action);

  if (reason) {
    return {
      status: 'rejected',
      reason,
    };
  }

  if (drone.battery < 20) {
    return {
      status: 'rejected',
      reason: {
        code: 'INSUFFICIENT_BATTERY',
        message: `Insufficient battery: ${drone.battery}%`,
      },
    };
  }

  const { flightPhase, flightMode } = nextPhaseAndMode(drone, action);

  return {
    status: 'success',
    drone: {
      flightPhase,
      flightMode,
    },
  };
};
