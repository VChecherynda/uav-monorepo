import { z } from "zod";
import type { DroneCommandConflictReason } from "./drone.js";
import { MissionConflictReasonSchema } from "./mission.js";

export const DroneNotFoundReasonSchema = z.object({
  code: z.literal("DRONE_NOT_FOUND"),
  message: z.string(),
});

export type DroneNotFoundReason = z.infer<typeof DroneNotFoundReasonSchema>;

export const MissionNotFoundReasonSchema = z.object({
  code: z.literal("MISSION_NOT_FOUND"),
  message: z.string(),
});

export type MissionNotFoundReason = z.infer<typeof MissionNotFoundReasonSchema>;

export type CommandRejectionReason =
  | DroneNotFoundReason
  | DroneCommandConflictReason;

export const MissionRejectionReasonSchema = z.discriminatedUnion("code", [
  DroneNotFoundReasonSchema,
  MissionNotFoundReasonSchema,
  MissionConflictReasonSchema,
]);

export type MissionRejectionReason = z.infer<
  typeof MissionRejectionReasonSchema
>;
