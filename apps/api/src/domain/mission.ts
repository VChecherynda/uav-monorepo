import type { Mission, Drone, MissionConflictReason } from "@uav/shared";

export const assignDrone = (
  mission: Mission,
  drone: Drone,
):
  | { status: "success"; mission: Pick<Mission, "droneId" | "status"> }
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

export const startMission = (
  mission: Mission,
  drone: Drone,
  waypointCount: number,
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

  if (!waypointCount) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    };
  }

  return {
    status: "success",
    mission: { status: "in-progress" },
    drone: { status: "active" },
  };
};
