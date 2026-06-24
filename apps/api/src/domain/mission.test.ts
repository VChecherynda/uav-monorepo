import { describe, it, expect } from "vitest";
import {
  assignDrone,
  abortMission,
  startMission,
  completeMission,
} from "../domain/mission.js";

const draftMission = {
  id: "m1",
  name: "test_name",
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
      status: "success",
      mission: {
        droneId: "d1",
        status: "assigned",
      },
    });
  });

  it.each([
    [
      draftMission,
      { ...idleDrone, status: "active" as const },
      { code: "DRONE_IS_NOT_READY", message: "Drone is not ready for mission" },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      {
        code: "MISSION_IS_NOT_DRAFT",
        message: "Only draft missions can be assigned",
      },
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
    [
      draftMission,
      idleDrone,
      3,
      {
        code: "MISSION_IS_NOT_ASSIGNED",
        message: "Only assigned missions can start",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      { ...idleDrone, status: "active" as const },
      3,
      {
        code: "DRONE_IS_NOT_READY",
        message: "Drone is not idle",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      0,
      {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    ],
  ])("rejects with reason: %s", (mission, drone, count, reason) => {
    expect(startMission(mission, drone, count)).toEqual({
      status: "rejected",
      reason,
    });
  });
});

describe("abortMission", () => {
  it("mission with assigned status aborted successfuly", () => {
    expect(abortMission({ ...draftMission, status: "assigned" })).toEqual({
      status: "success",
      mission: { status: "aborted" },
      drone: { status: "idle" },
    });
  });

  it("mission with in-progress status aborted successfuly", () => {
    expect(abortMission({ ...draftMission, status: "in-progress" })).toEqual({
      status: "success",
      mission: { status: "aborted" },
      drone: { status: "returning" },
    });
  });

  it.each([
    [
      { ...draftMission, status: "draft" as const },
      {
        status: "rejected",
        reason: {
          code: "MISSION_CANNOT_BE_ABORTED",
          message: 'Cannot abort mission in status "draft"',
        },
      },
    ],
    [
      { ...draftMission, status: "completed" as const },
      {
        status: "rejected",
        reason: {
          code: "MISSION_CANNOT_BE_ABORTED",
          message: 'Cannot abort mission in status "completed"',
        },
      },
    ],
    [
      { ...draftMission, status: "aborted" as const },
      {
        status: "rejected",
        reason: {
          code: "MISSION_CANNOT_BE_ABORTED",
          message: 'Cannot abort mission in status "aborted"',
        },
      },
    ],
  ])("rejects with status %s", (mission, result) => {
    expect(abortMission(mission)).toEqual(result);
  });
});

describe("completeMission", () => {
  it("mission with in-progress status completed successfuly", () => {
    expect(completeMission({ ...draftMission, status: "in-progress" })).toEqual(
      {
        status: "success",
        mission: { status: "completed" },
        drone: { status: "idle" },
      },
    );
  });

  it.each([
    [{ ...draftMission, status: "draft" as const }],
    [{ ...draftMission, status: "assigned" as const }],
    [{ ...draftMission, status: "completed" as const }],
    [{ ...draftMission, status: "aborted" as const }],
  ])("rejects with status %s", (mission) => {
    expect(completeMission(mission)).toEqual({
      status: "rejected",
      reason: {
        code: "MISSION_IS_NOT_IN_PROGRESS",
        message: "Only in-progress missions can be completed",
      },
    });
  });
});
