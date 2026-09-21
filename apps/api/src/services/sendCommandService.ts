import type {
  DroneCommandResult,
  DomainEvent,
  Drone,
  DroneAction,
} from '@uav/shared';
import { executeCommand } from '../domain/drone.js';
import { mapDrone } from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import type { Drone as PrismaDrone } from '@prisma/client';
import { broadcastEvent } from '../routes/ws.js';

export async function sendCommandService(
  drone: Drone,
  action: DroneAction,
): Promise<DroneCommandResult> {
  const next = executeCommand(drone, action);

  if (next.status === 'rejected') {
    const event: DomainEvent = {
      type: 'DroneCommandRejected',
      droneId: drone.id,
      action,
      reason: next.reason,
      at: new Date().toISOString(),
    };
    broadcastEvent(event);
    return next;
  }

  const updated = await prisma.drone.update({
    where: { id: drone.id },
    data: next.drone,
  });

  return {
    status: 'success',
    drone: mapDrone(updated),
  };
}
