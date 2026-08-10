import { z } from "zod";
import { CoordinateSchema } from "./geometry.js";

export const MissionStatusEnum = z.enum([
  "draft",
  "assigned",
  "in-progress",
  "completed",
  "aborted",
]);

export type MissionStatus = z.infer<typeof MissionStatusEnum>;

export const MissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  droneId: z.string().nullable(),
  waypoints: z.array(CoordinateSchema),
  status: MissionStatusEnum,
  reason: z.string().nullable(),
});

export type Mission = z.infer<typeof MissionSchema>;

export type MissionConflictReason =
  | { code: "DRONE_IS_NOT_READY"; message: string }
  | { code: "MISSION_IS_NOT_DRAFT"; message: string }
  | { code: "MISSION_IS_NOT_ASSIGNED"; message: string }
  | { code: "MISSION_HAS_NO_WAYPOINTS"; message: string }
  | { code: "MISSION_HAS_NO_DRONE"; message: string }
  | { code: "MISSION_CANNOT_BE_ABORTED"; message: string }
  | { code: "MISSION_IS_NOT_IN_PROGRESS"; message: string }
  | { code: "MISSION_CANNOT_BE_RESTORED"; message: string }
  | { code: "WAYPOINTS_CANNOT_BE_REPLACED"; message: string }
  | { code: "ROUTE_VIOLATES_ZONE"; message: string };
