import { it, expect } from "vitest";
import { mapMission, type MissionWithWaypoints } from "./mappers.js";

const prismaMission: MissionWithWaypoints = {
  name: "Prisma Mission",
  id: "M1",
  droneId: null,
  status: "draft",
  reason: null,
  createdAt: new Date(),
  waypoints: [],
};

it("throws error when mapping a row with unknown status", () => {
  expect(() => mapMission({ ...prismaMission, status: "draftt" })).toThrow();
});

it("maps prisma mission row into shared Mission", () => {
  expect(mapMission(prismaMission)).toStrictEqual({
    id: "M1",
    name: "Prisma Mission",
    droneId: null,
    waypoints: [],
    status: "draft",
    reason: null,
  });
});
