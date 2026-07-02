export type DroneAction = "return-home" | "land" | "takeoff";

export type DroneStatus = "active" | "idle" | "offline" | "returning";

export type Drone = {
  id: string;
  name: string;
  status: DroneStatus;
  battery: number;
  altitude: number;
  lng: number;
  lat: number;
};

export type DroneCommandConflictReason =
  | { code: "DRONE_OFFLINE"; message: string }
  | { code: "INSUFFICIENT_BATTERY"; message: string }
  | { code: "INVALID_TRANSITION"; message: string };

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
