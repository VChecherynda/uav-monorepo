import { z } from "zod";
import { CoordinateSchema } from "./geometry.js";

export const MissionStatusSchema = z.enum([
  "draft",
  "assigned",
  "in-progress",
  "completed",
  "aborted",
]);

export type MissionStatus = z.infer<typeof MissionStatusSchema>;

export const MissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  droneId: z.string().nullable(),
  waypoints: z.array(CoordinateSchema),
  status: MissionStatusSchema,
  reason: z.string().nullable(),
});

export type Mission = z.infer<typeof MissionSchema>;

export const ZoneViolationSchema = z.object({
  kind: z.enum(["waypoint", "segment"]),
  index: z.number(),
  zoneId: z.string(),
});

export type ZoneViolation = z.infer<typeof ZoneViolationSchema>;

export const RouteViolatesZoneSchema = z.object({
  code: z.literal("ROUTE_VIOLATES_ZONE"),
  message: z.string(),
  violations: z.array(ZoneViolationSchema),
});

const buildReason = <C extends string>(code: C) => {
  return z.object({
    code: z.literal(code),
    message: z.string(),
  });
};

export const MissionConflictReasonSchema = z.discriminatedUnion("code", [
  buildReason("DRONE_IS_NOT_READY"),
  buildReason("MISSION_IS_NOT_DRAFT"),
  buildReason("MISSION_IS_NOT_ASSIGNED"),
  buildReason("MISSION_HAS_NO_WAYPOINTS"),
  buildReason("MISSION_HAS_NO_DRONE"),
  buildReason("MISSION_CANNOT_BE_ABORTED"),
  buildReason("MISSION_IS_NOT_IN_PROGRESS"),
  buildReason("MISSION_CANNOT_BE_RESTORED"),
  buildReason("WAYPOINTS_CANNOT_BE_REPLACED"),
  RouteViolatesZoneSchema,
]);

export type MissionConflictReason = z.infer<typeof MissionConflictReasonSchema>;
