export type DroneStatus = "active" | "idle" | "offline";

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

export type WSConnectionStatus = "connecting" | "open" | "closed";

export type WSMessage =
  | { type: "drones:update"; data: Drone[] }
  | { type: "drone:command:result"; droneId: string; ok: boolean };
