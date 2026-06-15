import { describe, it, expect } from "vitest";
import { predictDroneChange } from "@uav/shared";

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
