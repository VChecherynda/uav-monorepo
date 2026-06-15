import type { CommandResult, DomainEvent, DroneAction } from "@uav/shared";
import { executeCommand } from "../domain/drone.js";
import { mapDrone } from "../lib/mappers.js";
import { prisma } from "../lib/prisma.js";
import { broadcastEvent } from "../routes/ws.js";

export async function sendCommandService(
  droneId: string,
  action: DroneAction,
): Promise<CommandResult> {
  const drone = await prisma.drone.findUnique({ where: { id: droneId } });

  if (!drone) {
    return {
      status: "rejected",
      reason: { code: "DRONE_NOT_FOUND", message: "Drone not found" },
    };
  }

  const next = executeCommand(mapDrone(drone), action);

  if (next.status === "rejected") {
    const event: DomainEvent = {
      type: "DroneCommandRejected",
      droneId,
      action,
      reason: next.reason,
      at: new Date().toISOString(),
    };
    broadcastEvent(event);
    return next;
  }

  const updated = await prisma.drone.update({
    where: { id: droneId },
    data: next.drone,
  });

  return {
    status: "success",
    drone: mapDrone(updated),
  };
}
