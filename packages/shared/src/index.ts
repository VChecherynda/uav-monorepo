export * from "./geometry.js";
export * from "./drone.js";
export * from "./mission.js";
export * from "./telemetry.js";
export * from "./reasons.js";
export * from "./commands.js";

import type { DroneAction, Drone } from "./drone.js";
import type { Mission } from "./mission.js";
import type {
  CommandRejectionReason,
  MissionRejectionReason,
} from "./reasons.js";

export type WSConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "lost";

export type SnapshotMessage = {
  type: "drones:snapshot";
  data: Drone[];
};

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
