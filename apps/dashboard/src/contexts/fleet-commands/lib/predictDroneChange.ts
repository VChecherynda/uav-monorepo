import { Drone, DroneAction, DroneStatus } from "@uav/shared";

const TRANSITIONS: Record<
  DroneAction,
  Partial<Record<DroneStatus, DroneStatus>>
> = {
  "return-home": {
    active: "returning",
    idle: "returning",
    returning: "returning",
  },
  land: {
    active: "idle",
    returning: "idle",
  },
  takeoff: {
    idle: "active",
  },
};

export function predictDroneChange(
  action: DroneAction,
  currentStatus: DroneStatus,
): Partial<Drone> | undefined {
  const nextStatus = TRANSITIONS[action][currentStatus];
  if (!nextStatus) return;
  return { status: nextStatus };
}
