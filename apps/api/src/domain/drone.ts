import type {
  Drone,
  DroneAction,
  DroneCommandConflictReason,
} from "@uav/shared";
import { predictDroneChange } from "@uav/shared";

export const executeCommand = (
  drone: Drone,
  action: DroneAction,
):
  | { status: "success"; drone: Partial<Drone> }
  | { status: "rejected"; reason: DroneCommandConflictReason } => {
  if (drone.status === "offline") {
    return {
      status: "rejected",
      reason: {
        code: "DRONE_OFFLINE",
        message: `Drone ${drone.name} is offline`,
      },
    };
  }

  const prediction = predictDroneChange(action, drone.status);
  if (!prediction) {
    return {
      status: "rejected",
      reason: {
        code: "INVALID_TRANSITION",
        message: `Cannot ${action} drone in status "${drone.status}"`,
      },
    };
  }

  if (drone.battery < 20) {
    return {
      status: "rejected",
      reason: {
        code: "INSUFFICIENT_BATTERY",
        message: `Insufficient battery: ${drone.battery}%`,
      },
    };
  }

  return {
    status: "success",
    drone: prediction,
  };
};
