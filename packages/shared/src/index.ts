export type DroneStatus = "active" | "idle" | "offline" | "returning";

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

export type WSConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "lost";

export type WSMessage =
  | { type: "drones:update"; data: Drone[] }
  | { type: "drone:command:result"; droneId: string; ok: boolean };

export type CommandRejectionReason =
  | { code: "DRONE_NOT_FOUND"; message: string }
  | { code: "DRONE_OFFLINE"; message: string }
  | { code: "INSUFFICIENT_BATTERY"; message: string; currentBattery: number }
  | { code: "ALREADY_RUNNING"; message: string };

export type CommandResult =
  | { status: "success"; drone: Drone }
  | { status: "rejected"; reason: CommandRejectionReason };
