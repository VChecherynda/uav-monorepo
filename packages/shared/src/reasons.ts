import type { DroneCommandConflictReason } from "./drone.js";
import type { MissionConflictReason } from "./mission.js";

export type DroneNotFoundReason = { code: "DRONE_NOT_FOUND"; message: string };

export type MissionNotFoundReason = {
  code: "MISSION_NOT_FOUND";
  message: string;
};

export type CommandRejectionReason =
  | DroneNotFoundReason
  | DroneCommandConflictReason;

export type MissionRejectionReason =
  | DroneNotFoundReason
  | MissionNotFoundReason
  | MissionConflictReason;
