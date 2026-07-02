export * from "./geometry.js";
export * from "./drone.js";
export * from "./mission.js";
export * from "./telemetry.js";
export * from "./reasons.js";
export * from "./commands.js";
export * from "./mission-results.js";

import type { DroneAction, Drone } from "./drone.js";
import type { CommandRejectionReason } from "./reasons.js";

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

export type WSMessage = SnapshotMessage | DomainEvent;
