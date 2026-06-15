import { describe, it, expect } from "vitest";
import { predictDroneChange, executeCommand } from "./drone.js";
import type { Drone, DroneAction, DroneStatus } from "@uav/shared";

describe("predictDroneChange", () => {
  describe("valid transitions", () => {
    it("returns 'returning' when RTH is issued to an active drone", () => {
      const result = predictDroneChange("return-home", "active");
      expect(result).toEqual({ status: "returning" });
    });

    it.each([
      ["return-home", "active", "returning"],
      ["return-home", "idle", "returning"],
      ["return-home", "returning", "returning"],
      ["land", "active", "idle"],
      ["land", "returning", "idle"],
      ["takeoff", "idle", "active"],
    ] as const)("%s on %s drone -> %s", (action, status, expected) => {
      expect(predictDroneChange(action, status)).toEqual({ status: expected });
    });
  });

  describe("invalid transitions return undefined", () => {
    it.each([
      ["return-home", "offline"],
      ["land", "idle"],
      ["land", "offline"],
      ["takeoff", "active"],
      ["takeoff", "offline"],
      ["takeoff", "returning"],
    ] as const)("%s on %s drone -> undefined", (action, status) => {
      expect(predictDroneChange(action, status)).toBeUndefined();
    });
  });
});

const defaultDrone: Drone = {
  id: "id_1",
  name: "Test-drone",
  status: "idle",
  battery: 80,
  altitude: 0,
  lng: 0,
  lat: 0,
};

const getSuccessStatus = (droneStatus: Drone["status"]) => {
  return { status: "success", drone: { status: droneStatus } };
};

describe("executeCommand", () => {
  describe("returns success patch for valid commands", () => {
    it.each([
      [defaultDrone, "return-home", getSuccessStatus("returning")],
      [
        { ...defaultDrone, status: "active" },
        "return-home",
        getSuccessStatus("returning"),
      ],
      [
        { ...defaultDrone, status: "returning" },
        "return-home",
        getSuccessStatus("returning"),
      ],
      [{ ...defaultDrone, status: "active" }, "land", getSuccessStatus("idle")],
      [
        { ...defaultDrone, status: "returning" },
        "land",
        getSuccessStatus("idle"),
      ],
      [
        { ...defaultDrone, status: "idle" },
        "takeoff",
        getSuccessStatus("active"),
      ],
    ] as const)(
      "case %#: executeCommand returns correct patch",
      (drone, action, result) => {
        expect(executeCommand(drone, action)).toEqual(result);
      },
    );
  });

  describe("rejects invalid commands", () => {
    it("rejects offline drone", () => {
      const result = executeCommand(
        { ...defaultDrone, status: "offline" },
        "takeoff",
      );
      expect(result).toEqual({
        status: "rejected",
        reason: {
          code: "DRONE_OFFLINE",
          message: `Drone ${defaultDrone.name} is offline`,
        },
      });
    });

    it("rejects invalid transition", () => {
      const ACTION: DroneAction = "land";
      const DRONE_STATUS: DroneStatus = "idle";

      const result = executeCommand(
        { ...defaultDrone, status: DRONE_STATUS },
        ACTION,
      );
      expect(result).toEqual({
        status: "rejected",
        reason: {
          code: "INVALID_TRANSITION",
          message: `Cannot ${ACTION} drone in status "${DRONE_STATUS}"`,
        },
      });
    });

    it("rejects low battery", () => {
      const LOW_BATTERY_CHARGE = 19;

      const result = executeCommand(
        { ...defaultDrone, battery: LOW_BATTERY_CHARGE },
        "takeoff",
      );
      expect(result).toEqual({
        status: "rejected",
        reason: {
          code: "INSUFFICIENT_BATTERY",
          message: `Insufficient battery: ${LOW_BATTERY_CHARGE}%`,
        },
      });
    });
  });
});
