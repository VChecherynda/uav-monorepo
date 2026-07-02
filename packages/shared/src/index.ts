export * from "./geometry.js";
export * from "./drone.js";
export * from "./mission.js";
export * from "./telemetry.js";

import type { Coordinate } from "./geometry.js";
import type {
  DroneAction,
  Drone,
  DroneCommandConflictReason,
} from "./drone.js";
import type { Mission, MissionConflictReason } from "./mission.js";

export type Geofence = {
  id: string;
  name: string;
  area: Coordinate[];
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
