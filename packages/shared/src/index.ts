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

export type Coordinate = {
  lng: number;
  lat: number;
};

export type Geofence = {
  id: string;
  name: string;
  area: Coordinate[];
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

export type DroneNotFoundReason = { code: "DRONE_NOT_FOUND"; message: string };

export type MissionNotFoundReason = {
  code: "MISSION_NOT_FOUND";
  message: string;
};

export type DroneCommandConflictReason =
  | { code: "DRONE_OFFLINE"; message: string }
  | { code: "INSUFFICIENT_BATTERY"; message: string }
  | { code: "INVALID_TRANSITION"; message: string };

export type CommandRejectionReason =
  | DroneNotFoundReason
  | DroneCommandConflictReason;

export type MissionConflictReason =
  | { code: "DRONE_IS_NOT_READY"; message: string }
  | { code: "MISSION_IS_NOT_DRAFT"; message: string }
  | { code: "MISSION_IS_NOT_ASSIGNED"; message: string }
  | { code: "MISSION_HAS_NO_WAYPOINTS"; message: string };

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

export type WSMessage = SnapshotMessage | DomainEvent;

const TRANSITIONS: Record<
  DroneAction,
  Partial<Record<DroneStatus, DroneStatus>>
> = {
  "return-home": {
    active: "returning",
    idle: "returning",
    returning: "returning",
  },
  land: {
    active: "idle",
    returning: "idle",
  },
  takeoff: {
    idle: "active",
  },
};

export function predictDroneChange(
  action: DroneAction,
  currentStatus: DroneStatus,
): Partial<Drone> | undefined {
  const nextStatus = TRANSITIONS[action][currentStatus];
  if (!nextStatus) return;
  return { status: nextStatus };
}
