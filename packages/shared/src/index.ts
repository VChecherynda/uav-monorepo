export type DroneAction = "return-home" | "land" | "takeoff";

export type DroneStatus = "active" | "idle" | "offline" | "returning";

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

export type Drone = {
  id: string;
  name: string;
  status: DroneStatus;
  battery: number;
  altitude: number;
  lng: number;
  lat: number;
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
  droneId: string;
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

export type CommandRejectionReason =
  | { code: "DRONE_NOT_FOUND"; message: string }
  | { code: "DRONE_OFFLINE"; message: string }
  | { code: "INSUFFICIENT_BATTERY"; message: string; currentBattery: number }
  | { code: "ALREADY_RUNNING"; message: string };

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
  | { status: "rejected"; reason: string };

export type StartMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | { status: "rejected"; reason: string };

export type WSMessage = SnapshotMessage | DomainEvent;
