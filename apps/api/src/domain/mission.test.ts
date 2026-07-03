import { describe, it, expect } from "vitest";
import {
  assignDrone,
  abortMission,
  startMission,
  completeMission,
} from "../domain/mission.js";
import type { Geofence } from "@uav/shared";

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
  lng: 8,
  lat: 12,
  battery: 80,
};

const defaultWaypoints = [
  { lng: 8, lat: 12 },
  { lng: 12, lat: 22 },
  { lng: 33, lat: 30 },
  { lng: 38, lat: 30 },
];

const noFlyZone1 = {
  id: "id_1",
  name: "zone 1",
  area: [
    { lng: 10, lat: 5 },
    { lng: 20, lat: 5 },
    { lng: 20, lat: 15 },
    { lng: 10, lat: 15 },
  ],
};

const noFlyZone2 = {
  id: "id_2",
  name: "zone 2",
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

describe("startMission", () => {
  it("mission is started successfully", () => {
    expect(
      startMission(
        { ...draftMission, status: "assigned" as const },
        idleDrone,
        defaultWaypoints,
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
      defaultWaypoints,
      {
        code: "MISSION_IS_NOT_ASSIGNED",
        message: "Only assigned missions can start",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      { ...idleDrone, status: "active" as const },
      defaultWaypoints,
      {
        code: "DRONE_IS_NOT_READY",
        message: "Drone is not idle",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      [],
      {
        code: "MISSION_HAS_NO_WAYPOINTS",
        message: "Mission should have waypoints",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      [
        { lng: 15, lat: 12 },
        { lng: 23, lat: 30 },
        { lng: 38, lat: 30 },
      ],
      {
        code: "ROUTE_VIOLATES_ZONE",
        message:
          "Waypoint 1 is inside zone zone 1; Segment 1 crosses zone zone 1; Segment 2 crosses zone zone 1",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      [
        { lng: 12, lat: 22 },
        { lng: 37, lat: 22 },
        { lng: 38, lat: 30 },
      ],
      {
        code: "ROUTE_VIOLATES_ZONE",
        message:
          "Waypoint 2 is inside zone zone 2; Segment 2 crosses zone zone 2; Segment 3 crosses zone zone 2",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      [
        { lng: 12, lat: 22 },
        { lng: 45, lat: 22 },
        { lng: 50, lat: 30 },
      ],
      {
        code: "ROUTE_VIOLATES_ZONE",
        message: "Segment 2 crosses zone zone 2",
      },
    ],
    [
      { ...draftMission, status: "assigned" as const },
      idleDrone,
      [
        { lng: 23, lat: 12 },
        { lng: 23, lat: 30 },
        { lng: 38, lat: 30 },
      ],
      {
        code: "ROUTE_VIOLATES_ZONE",
        message: "Segment 1 crosses zone zone 1",
      },
    ],
  ])("rejects with reason: %s", (mission, drone, waypoints, reason) => {
    expect(
      startMission(mission, drone, waypoints, [noFlyZone1, noFlyZone2]),
    ).toEqual({
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
