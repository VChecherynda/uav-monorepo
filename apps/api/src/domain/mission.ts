import type {
  Mission,
  Geofence,
  Drone,
  MissionConflictReason,
  Coordinate,
} from "@uav/shared";
import { isPointInPolygon, segmentIntersectsPolygon } from "@uav/shared";

export const assignDrone = (
  mission: Mission,
  drone: Drone,
):
  | {
      status: "success";
      mission: Pick<Mission, "status"> & { droneId: string };
    }
  | { status: "rejected"; reason: MissionConflictReason } => {
  if (drone.status !== "idle") {
    return {
      status: "rejected",
      reason: {
        code: "DRONE_IS_NOT_READY",
        message: "Drone is not ready for mission",
      },
    };
  }

  if (mission.status !== "draft") {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_IS_NOT_DRAFT",
        message: "Only draft missions can be assigned",
      },
    };
  }

  return {
    status: "success",
    mission: {
      droneId: drone.id,
      status: "assigned",
    },
  };
};

export type StartMissionPatch = {
  status: "success";
  mission: Pick<Mission, "status">;
  drone: Pick<Drone, "status">;
};

export type AbortMissionPatch = {
  status: "success";
  mission: Pick<Mission, "status">;
  drone: Pick<Drone, "status">;
};

export type CompleteMissionPatch = {
  status: "success";
  mission: Pick<Mission, "status">;
  drone: Pick<Drone, "status">;
};

export const canReplaceWaypoints = (
  mission: Mission,
):
  | { status: "success" }
  | { status: "rejected"; reason: MissionConflictReason } => {
  if (mission.status !== "draft") {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_IS_NOT_DRAFT",
        message: "Waypoints can only be replaced while mission is draft",
      },
    };
  }

  return {
    status: "success",
  };
};

export const startMission = (
  mission: Mission,
  drone: Drone,
  zones: Geofence[],
):
  | StartMissionPatch
  | { status: "rejected"; reason: MissionConflictReason } => {
  if (mission.status !== "assigned") {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_IS_NOT_ASSIGNED",
        message: "Only assigned missions can start",
      },
    };
  }

  if (drone.status !== "idle") {
    return {
      status: "rejected",
      reason: { code: "DRONE_IS_NOT_READY", message: "Drone is not idle" },
    };
  }

  if (!mission.waypoints.length) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    };
  }

  const rejectedMessages: string[] = [];
  const route = [{ lng: drone.lng, lat: drone.lat }, ...mission.waypoints];

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (!zone) {
      continue;
    }

    for (let j = 0; j < mission.waypoints.length; j++) {
      const w = mission.waypoints[j];
      if (!w) {
        continue;
      }

      const result = isPointInPolygon(w, zone.area);
      if (result) {
        rejectedMessages.push(`Waypoint ${j + 1} is inside zone ${zone.name}`);
      }
    }

    for (let j = 0; j < route.length - 1; j++) {
      const s = route[j];
      const g = route[j + 1];

      if (!s || !g) {
        continue;
      }

      const result = segmentIntersectsPolygon(s, g, zone.area);
      if (result) {
        rejectedMessages.push(`Segment ${j + 1} crosses zone ${zone.name}`);
      }
    }
  }

  if (rejectedMessages.length) {
    return {
      status: "rejected",
      reason: {
        code: "ROUTE_VIOLATES_ZONE",
        message: rejectedMessages.join("; "),
      },
    };
  }

  return {
    status: "success",
    mission: { status: "in-progress" },
    drone: { status: "active" },
  };
};

export const abortMission = (
  mission: Mission,
):
  | AbortMissionPatch
  | { status: "rejected"; reason: MissionConflictReason } => {
  if (mission.status !== "assigned" && mission.status !== "in-progress") {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_CANNOT_BE_ABORTED",
        message: `Cannot abort mission in status "${mission.status}"`,
      },
    };
  }

  if (mission.status === "assigned") {
    return {
      status: "success",
      mission: { status: "aborted" },
      drone: { status: "idle" },
    };
  } else {
    return {
      status: "success",
      mission: { status: "aborted" },
      drone: { status: "returning" },
    };
  }
};

export const completeMission = (
  mission: Mission,
):
  | CompleteMissionPatch
  | { status: "rejected"; reason: MissionConflictReason } => {
  if (mission.status !== "in-progress") {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_IS_NOT_IN_PROGRESS",
        message: "Only in-progress missions can be completed",
      },
    };
  }

  return {
    status: "success",
    mission: { status: "completed" },
    drone: { status: "idle" },
  };
};
