export * from "./geometry.js";
export * from "./drone.js";

import type { Coordinate } from "./geometry.js";
import type {
  DroneAction,
  Drone,
  DroneCommandConflictReason,
} from "./drone.js";

export type MissionStatus =
  | "draft"
  | "assigned"
  | "in-progress"
  | "completed"
  | "aborted";

export type User = {
  id: string;
  email: string;
};

export type Geofence = {
  id: string;
  name: string;
  area: Coordinate[];
};

export type Telemetry = {
  id: string;
  droneId: string;
  battery: number;
  altitude: number;
  lng: number;
  lat: number;
};

export type Mission = {
  id: string;
  name: string;
  droneId: string | undefined;
  status: MissionStatus;
  reason: string | undefined;
};

export type WSConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "lost";

export type SnapshotMessage = {
  type: "drones:snapshot";
  data: Drone[];
};

export type DroneNotFoundReason = { code: "DRONE_NOT_FOUND"; message: string };

export type MissionNotFoundReason = {
  code: "MISSION_NOT_FOUND";
  message: string;
};

export type CommandRejectionReason =
  | DroneNotFoundReason
  | DroneCommandConflictReason;

export type MissionConflictReason =
  | { code: "DRONE_IS_NOT_READY"; message: string }
  | { code: "MISSION_IS_NOT_DRAFT"; message: string }
  | { code: "MISSION_IS_NOT_ASSIGNED"; message: string }
  | { code: "MISSION_HAS_NO_WAYPOINTS"; message: string }
  | { code: "MISSION_HAS_NO_DRONE"; message: string }
  | { code: "MISSION_CANNOT_BE_ABORTED"; message: string }
  | { code: "MISSION_IS_NOT_IN_PROGRESS"; message: string };

export type MissionRejectionReason =
  | DroneNotFoundReason
  | MissionNotFoundReason
  | MissionConflictReason;

export type DomainEvent =
  | {
      type: "DroneCommandRejected";
      droneId: string;
      action: DroneAction;
      reason: CommandRejectionReason;
      at: string;
    }
  | {
      type: "BatteryCritical";
      droneId: string;
      battery: number;
      at: string;
    }
  | {
      type: "DroneRecovered";
      droneId: string;
      at: string;
    };

export type CommandResult =
  | { status: "success"; drone: Drone }
  | { status: "rejected"; reason: CommandRejectionReason };

export type AssignResult =
  | {
      status: "success";
      mission: Mission;
    }
  | { status: "rejected"; reason: MissionRejectionReason };

export type StartMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };

export type AbortMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };

export type CompleteMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };

export type WSMessage = SnapshotMessage | DomainEvent;
