import { describe, it, expect } from "vitest";
import { assignDrone, startMission } from "../domain/mission.js";

const draftMission = {
  id: "m1",
  droneId: "",
  status: "draft" as const,
  reason: undefined,
};

const idleDrone = {
  id: "d1",
  name: "test_d1",
  status: "idle" as const,
  altitude: 0,
  lng: 0,
  lat: 0,
  battery: 80,
};

describe("assignDrone", () => {
  it("assigns an idle to the a draft mission", () => {
    expect(assignDrone(draftMission, idleDrone)).toEqual({
      droneId: "d1",
      status: "assigned",
    });
  });

  it.each([
    [
      draftMission,
      { ...idleDrone, status: "active" as const },
      "Drone is busy",
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      "Only draft missions can be assigned",
    ],
  ])("rejects with reason: %s", (mission, drone, reason) => {
    expect(assignDrone(mission, drone)).toEqual({ status: "rejected", reason });
  });
});

describe("startMission", () => {
  it("mission is started successfully", () => {
    expect(
      startMission(
        { ...draftMission, status: "assigned" as const },
        idleDrone,
        3,
      ),
    ).toEqual({
      status: "success",
      mission: { status: "in-progress" },
      drone: { status: "active" },
    });
  });

  it.each([
    [draftMission, idleDrone, 3, "Only assigned missions can start"],
    [
      { ...draftMission, status: "assigned" as const },
      { ...idleDrone, status: "active" as const },
      3,
      "Drone is not idle",
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      0,
      "Mission should have waypoints",
    ],
  ])("rejects with reason: %s", (mission, drone, count, reason) => {
    expect(startMission(mission, drone, count)).toEqual({
      status: "rejected",
      reason,
    });
  });
});
