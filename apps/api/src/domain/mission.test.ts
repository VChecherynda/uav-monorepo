import { describe, it, expect } from "vitest";
import {
  assignDrone,
  abortMission,
  startMission,
  completeMission,
  canReplaceWaypoints,
  canAssignMission,
} from "../domain/mission.js";

const defaultWaypoints = [
  { lng: 8, lat: 12 },
  { lng: 12, lat: 22 },
  { lng: 33, lat: 30 },
  { lng: 38, lat: 30 },
];

const draftMission = {
  id: "m1",
  name: "test_name",
  droneId: "",
  waypoints: defaultWaypoints,
  status: "draft" as const,
  reason: undefined,
};

const idleDrone = {
  id: "d1",
  name: "test_d1",
  status: "idle" as const,
  altitude: 0,
  lng: 8,
  lat: 12,
  battery: 80,
};

const noFlyZone1 = {
  id: "id_1",
  name: "Alpha",
  area: [
    { lng: 10, lat: 5 },
    { lng: 20, lat: 5 },
    { lng: 20, lat: 15 },
    { lng: 10, lat: 15 },
  ],
};

const noFlyZone2 = {
  id: "id_2",
  name: "Bravo",
  area: [
    { lng: 30, lat: 15 },
    { lng: 40, lat: 15 },
    { lng: 40, lat: 25 },
    { lng: 30, lat: 25 },
  ],
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

describe("canMissionAssigned", () => {
  it("can mission be assigned", () => {
    expect(
      canAssignMission({
        ...draftMission,
        waypoints: [],
        status: "assigned" as const,
      }),
    ).toEqual({
      status: "rejected",
      reason: {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    });
  });
});

describe("canReplaceWaypoints", () => {
  it.each([
    [{ ...draftMission }],
    [{ ...draftMission, status: "assigned" as const }],
  ])("can replace mission waypoints", (mission) => {
    expect(canReplaceWaypoints(mission)).toEqual({
      status: "success",
    });
  });

  it.each([
    [{ ...draftMission, status: "in-progress" as const }],
    [{ ...draftMission, status: "completed" as const }],
    [{ ...draftMission, status: "aborted" as const }],
  ])("rejects waypoint replacement for locked mission %s", (mission) => {
    expect(canReplaceWaypoints(mission)).toEqual({
      status: "rejected",
      reason: {
        code: "WAYPOINTS_CANNOT_BE_REPLACED",
        message:
          "Waypoints can only be replaced while mission is draft or assigned",
      },
    });
  });
});

describe("startMission", () => {
  it("mission is started successfully", () => {
    expect(
      startMission(
        { ...draftMission, status: "assigned" as const },
        idleDrone,
        [noFlyZone1, noFlyZone2],
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
      {
        code: "MISSION_IS_NOT_ASSIGNED",
        message: "Only assigned missions can start",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      { ...idleDrone, status: "active" as const },
      {
        code: "DRONE_IS_NOT_READY",
        message: "Drone is not idle",
      },
    ],
    [
      { ...draftMission, waypoints: [], status: "assigned" as const },
      idleDrone,
      {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    ],
    [
      {
        ...draftMission,
        waypoints: [
          { lng: 15, lat: 12 },
          { lng: 23, lat: 30 },
          { lng: 38, lat: 30 },
        ],
        status: "assigned" as const,
      },
      idleDrone,
      {
        code: "ROUTE_VIOLATES_ZONE",
        message:
          "Waypoint 1 is inside zone Alpha; Segment 1 crosses zone Alpha; Segment 2 crosses zone Alpha",
      },
    ],
    [
      {
        ...draftMission,
        waypoints: [
          { lng: 12, lat: 22 },
          { lng: 37, lat: 22 },
          { lng: 38, lat: 30 },
        ],
        status: "assigned" as const,
      },
      idleDrone,
      {
        code: "ROUTE_VIOLATES_ZONE",
        message:
          "Waypoint 2 is inside zone Bravo; Segment 2 crosses zone Bravo; Segment 3 crosses zone Bravo",
      },
    ],
    [
      {
        ...draftMission,
        waypoints: [
          { lng: 12, lat: 22 },
          { lng: 45, lat: 22 },
          { lng: 50, lat: 30 },
        ],
        status: "assigned" as const,
      },
      idleDrone,
      {
        code: "ROUTE_VIOLATES_ZONE",
        message: "Segment 2 crosses zone Bravo",
      },
    ],
    [
      {
        ...draftMission,
        waypoints: [
          { lng: 23, lat: 12 },
          { lng: 23, lat: 30 },
          { lng: 38, lat: 30 },
        ],
        status: "assigned" as const,
      },
      idleDrone,
      {
        code: "ROUTE_VIOLATES_ZONE",
        message: "Segment 1 crosses zone Alpha",
      },
    ],
  ])("rejects with reason: %s", (mission, drone, reason) => {
    expect(startMission(mission, drone, [noFlyZone1, noFlyZone2])).toEqual({
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
