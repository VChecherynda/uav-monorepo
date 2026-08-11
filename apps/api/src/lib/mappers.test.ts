import { it, expect } from "vitest";
import { mapMission, mapDrone, type MissionWithWaypoints } from "./mappers.js";
import type { Drone as PrismaDrone } from "@prisma/client";

const prismaMission: MissionWithWaypoints = {
  name: "Prisma Mission",
  id: "M1",
  droneId: "D1",
  status: "draft",
  reason: null,
  createdAt: new Date(),
  waypoints: [],
};

const prismaDrone: PrismaDrone = {
  name: "Prisma Drone",
  id: "D1",
  status: "idle",
  lng: 133,
  lat: -20,
  battery: 80,
  altitude: 100,
  homeLng: 133,
  homeLat: -25,
  createdAt: new Date(),
  updatedAt: new Date(),
};

it("throws error when mapping a mission row with unknown status", () => {
  expect(() => mapMission({ ...prismaMission, status: "draftt" })).toThrow();
});

it("drops db-only fields from mission payload", () => {
  expect(mapMission(prismaMission)).toEqual({
    id: "M1",
    name: "Prisma Mission",
    droneId: "D1",
    waypoints: [],
    status: "draft",
    reason: null,
  });
});

it("reports unset fields as null", () => {
  expect(mapMission({ ...prismaMission, droneId: null })).toStrictEqual({
    id: "M1",
    name: "Prisma Mission",
    droneId: null,
    waypoints: [],
    status: "draft",
    reason: null,
  });
});

it("throws error when mapping a drone row with unknown status", () => {
  expect(() => mapDrone({ ...prismaDrone, status: "idlee" })).toThrow();
});

it("drops db-only fields from drone payload", () => {
  expect(mapDrone(prismaDrone)).toStrictEqual({
    id: "D1",
    name: "Prisma Drone",
    status: "idle",
    battery: 80,
    altitude: 100,
    lng: 133,
    lat: -20,
  });
});
