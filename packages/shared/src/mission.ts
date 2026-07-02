export type MissionStatus =
  | "draft"
  | "assigned"
  | "in-progress"
  | "completed"
  | "aborted";

export type Mission = {
  id: string;
  name: string;
  droneId: string | undefined;
  status: MissionStatus;
  reason: string | undefined;
};

export type MissionConflictReason =
  | { code: "DRONE_IS_NOT_READY"; message: string }
  | { code: "MISSION_IS_NOT_DRAFT"; message: string }
  | { code: "MISSION_IS_NOT_ASSIGNED"; message: string }
  | { code: "MISSION_HAS_NO_WAYPOINTS"; message: string }
  | { code: "MISSION_HAS_NO_DRONE"; message: string }
  | { code: "MISSION_CANNOT_BE_ABORTED"; message: string }
  | { code: "MISSION_IS_NOT_IN_PROGRESS"; message: string };
