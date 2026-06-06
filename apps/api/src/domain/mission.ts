import type { Mission, Drone } from "@uav/shared";

export type AssignedMissionPatch = Pick<Mission, "droneId" | "status">;

export const assignDrone = (
  mission: Mission,
  drone: Drone,
): AssignedMissionPatch | { status: "rejected"; reason: string } => {
  if (drone.status === "active") {
    return { status: "rejected", reason: "Drone is busy" };
  }

  if (mission.status !== "draft") {
    return {
      status: "rejected",
      reason: "Only draft missions can be assigned",
    };
  }

  return {
    droneId: drone.id,
    status: "assigned",
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
): StartMissionPatch | { status: "rejected"; reason: string } => {
  if (mission.status !== "assigned") {
    return { status: "rejected", reason: "Only assigned missions can start" };
  }

  if (drone.status !== "idle") {
    return { status: "rejected", reason: "Drone is not idle" };
  }

  if (!waypointCount) {
    return { status: "rejected", reason: "Mission should have waypoints" };
  }

  return {
    status: "success",
    mission: { status: "in-progress" },
    drone: { status: "active" },
  };
};
