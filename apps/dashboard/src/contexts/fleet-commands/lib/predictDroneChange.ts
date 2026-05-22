import { Drone } from "@uav/shared";
import { DroneAction } from "../api/sendCommand";

export function predictDroneChange(action: DroneAction): Partial<Drone> {
  switch (action) {
    case "return-home":
      return { status: "returning" };
    case "land":
      return { status: "idle" };
    case "takeoff":
      return { status: "active" };
  }
}
