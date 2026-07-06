import type {
  AssignResult,
  ReplaceWaypointsResult,
  StartMissionServiceResult,
  AbortMissionServiceResult,
  CompleteMissionServiceResult,
  Geofence,
  Coordinate,
} from "@uav/shared";
import {
  assignDrone,
  startMission,
  abortMission,
  completeMission,
  canReplaceWaypoints,
} from "../domain/mission.js";
import { mapMission, mapDrone, mapWaypoints } from "../lib/mappers.js";
import { prisma } from "../lib/prisma.js";

// TODO: move zones to DB table (known debt).
const ZONES: Geofence[] = [
  {
    id: "zone-airport",
    name: "Alice Springs Airport",
    area: [
      { lng: 133.892, lat: -23.812 },
      { lng: 133.912, lat: -23.812 },
      { lng: 133.912, lat: -23.792 },
      { lng: 133.892, lat: -23.792 },
    ],
  },
  {
    id: "zone-restricted-north",
    name: "Restricted North",
    area: [
      { lng: 133.86, lat: -23.66 },
      { lng: 133.89, lat: -23.66 },
      { lng: 133.89, lat: -23.64 },
      { lng: 133.86, lat: -23.64 },
    ],
  },
];

export async function assignMission(
  missionId: string,
  droneId: string,
): Promise<AssignResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!missionRow) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_NOT_FOUND",
        message: "Mission not found",
      },
    };
  }

  const droneRow = await prisma.drone.findUnique({ where: { id: droneId } });

  if (!droneRow) {
    return {
      status: "rejected",
      reason: { code: "DRONE_NOT_FOUND", message: "Drone not found" },
    };
  }

  const next = assignDrone(mapMission(missionRow), mapDrone(droneRow));

  if (next.status === "rejected") {
    return next;
  }

  const updated = await prisma.mission.update({
    where: { id: missionId },
    data: next.mission,
  });

  return {
    status: "success",
    mission: mapMission(updated),
  };
}

export async function replaceWaypointsService(
  missionId: string,
  waypoints: Coordinate[],
): Promise<ReplaceWaypointsResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!missionRow) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_NOT_FOUND",
        message: "Mission not found",
      },
    };
  }

  const next = canReplaceWaypoints(mapMission(missionRow));
  if (next.status === "rejected") {
    return next;
  }

  const [_, savedWaypoints] = await prisma.$transaction([
    prisma.waypoint.deleteMany({
      where: { missionId },
    }),
    prisma.waypoint.createManyAndReturn({
      data: waypoints.map((w) => ({ missionId, ...w })),
    }),
  ]);

  return {
    status: "success",
    waypoints: mapWaypoints(savedWaypoints),
  };
}

export async function startMissionService(
  missionId: string,
): Promise<StartMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!missionRow) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_NOT_FOUND",
        message: "Mission not found",
      },
    };
  }

  const { droneId } = missionRow;
  if (droneId === null) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_HAS_NO_DRONE",
        message: "Mission has no drone",
      },
    };
  }

  const [droneRow, waypoints] = await Promise.all([
    prisma.drone.findUnique({ where: { id: droneId } }),
    prisma.waypoint.findMany({
      where: { missionId },
      orderBy: { recordedAt: "asc" },
    }),
  ]);

  if (!droneRow) {
    return {
      status: "rejected",
      reason: { code: "DRONE_NOT_FOUND", message: "Drone not found" },
    };
  }

  const next = startMission(
    mapMission(missionRow),
    mapDrone(droneRow),
    mapWaypoints(waypoints),
    ZONES,
  );

  if (next.status === "rejected") {
    return next;
  }

  const [updatedMission, updatedDrone] = await prisma.$transaction([
    prisma.mission.update({
      where: { id: missionId },
      data: next.mission,
    }),
    prisma.drone.update({
      where: { id: droneId },
      data: next.drone,
    }),
  ]);

  return {
    status: "success",
    mission: mapMission(updatedMission),
    drone: mapDrone(updatedDrone),
  };
}

export async function abortMissionService(
  missionId: string,
): Promise<AbortMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!missionRow) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_NOT_FOUND",
        message: "Mission not found",
      },
    };
  }

  const next = abortMission(mapMission(missionRow));
  if (next.status === "rejected") {
    return next;
  }

  const [updatedMission, updatedDrone] = await prisma.$transaction([
    prisma.mission.update({
      where: { id: missionId },
      data: next.mission,
    }),
    prisma.drone.update({
      where: { id: missionRow.droneId! },
      data: next.drone,
    }),
  ]);

  return {
    status: "success",
    mission: mapMission(updatedMission),
    drone: mapDrone(updatedDrone),
  };
}

export async function completeMissionService(
  missionId: string,
): Promise<CompleteMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!missionRow) {
    return {
      status: "rejected",
      reason: {
        code: "MISSION_NOT_FOUND",
        message: "Mission not found",
      },
    };
  }

  const next = completeMission(mapMission(missionRow));
  if (next.status === "rejected") {
    return next;
  }

  const [updatedMission, updatedDrone] = await prisma.$transaction([
    prisma.mission.update({
      where: { id: missionId },
      data: next.mission,
    }),
    prisma.drone.update({
      where: { id: missionRow.droneId! },
      data: next.drone,
    }),
  ]);

  return {
    status: "success",
    mission: mapMission(updatedMission),
    drone: mapDrone(updatedDrone),
  };
}
