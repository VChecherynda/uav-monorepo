import { z } from "zod";

export const DroneActionSchema = z.enum(["return-home", "land", "takeoff"]);

export type DroneAction = z.infer<typeof DroneActionSchema>;

export const DroneStatusSchema = z.enum([
  "active",
  "idle",
  "assigned",
  "offline",
  "returning",
]);

export type DroneStatus = z.infer<typeof DroneStatusSchema>;

export const DroneSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: DroneStatusSchema,
  battery: z.number(),
  altitude: z.number(),
  lng: z.number(),
  lat: z.number(),
});

export type Drone = z.infer<typeof DroneSchema>;

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
