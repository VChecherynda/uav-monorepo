import type { Drone, DroneAction } from "./drone.js";
import type { CommandRejectionReason } from "./reasons.js";

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
