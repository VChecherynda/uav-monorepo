import {
  type AssignResult,
  type UnassignResult,
  type ReplaceWaypointsResult,
  type StartMissionServiceResult,
  type AbortMissionServiceResult,
  type RestoreMissionServiceResult,
  type CompleteMissionServiceResult,
  type Coordinate,
  type MissionRejectionReason,
  GeofenceSchema,
  MissionStatusSchema,
  type RejectedDrone,
  type TerminateMissionServiceResult,
} from '@uav/shared';
import {
  assignDrone,
  startMission,
  abortMission,
  completeMission,
  canReplaceWaypoints,
  restoreMission,
  unassignDrone,
  terminateMission,
} from '../domain/mission.js';
import {
  mapMission,
  mapDrone,
  mapWaypoints,
  mapDrones,
} from '../lib/mappers.js';
import { prisma } from '../lib/prisma.js';
import { sendCommandService } from './sendCommandService.js';

class MissionRejectedError extends Error {
  constructor(public reason: MissionRejectionReason) {
    super(reason.message);
  }
}

export async function assignMission(
  missionId: string,
  droneId: string,
): Promise<AssignResult> {
  try {
    const updatedDrone = await prisma.$transaction(async (tx) => {
      const missionRow = await tx.mission.findUnique({
        where: { id: missionId },
      });

      if (!missionRow) {
        throw new MissionRejectedError({
          code: 'MISSION_NOT_FOUND',
          message: 'Mission not found',
        });
      }

      const droneRow = await tx.drone.findUnique({
        where: { id: droneId },
      });
      if (!droneRow) {
        throw new MissionRejectedError({
          code: 'DRONE_NOT_FOUND',
          message: 'Drone not found',
        });
      }

      const nextDrone = assignDrone(
        { status: MissionStatusSchema.parse(missionRow.status) },
        mapDrone(droneRow),
      );
      if (nextDrone.status === 'rejected') {
        throw new MissionRejectedError(nextDrone.reason);
      }

      const updatedDrone = await tx.drone.update({
        where: {
          id: droneId,
        },
        data: {
          missionId,
        },
      });

      return updatedDrone;
    });

    return {
      status: 'success',
      drone: mapDrone(updatedDrone),
    };
  } catch (e) {
    if (e instanceof MissionRejectedError) {
      return { status: 'rejected', reason: e.reason };
    }

    throw e;
  }
}

export async function unassignMission(
  missionId: string,
  droneId: string,
): Promise<UnassignResult> {
  try {
    const updatedDrone = await prisma.$transaction(async (tx) => {
      const missionRow = await tx.mission.findUnique({
        where: { id: missionId },
      });

      if (!missionRow) {
        throw new MissionRejectedError({
          code: 'MISSION_NOT_FOUND',
          message: 'Mission not found',
        });
      }

      const droneRow = await tx.drone.findUnique({
        where: { id: droneId },
      });
      if (!droneRow) {
        throw new MissionRejectedError({
          code: 'DRONE_NOT_FOUND',
          message: 'Drone not found',
        });
      }

      const nextDrone = unassignDrone(
        {
          id: missionRow.id,
          status: MissionStatusSchema.parse(missionRow.status),
        },
        mapDrone(droneRow),
      );
      if (nextDrone.status === 'rejected') {
        throw new MissionRejectedError(nextDrone.reason);
      }

      return await tx.drone.update({
        where: {
          id: droneId,
        },
        data: {
          missionId: null,
        },
      });
    });

    return {
      status: 'success',
      drone: mapDrone(updatedDrone),
    };
  } catch (e) {
    if (e instanceof MissionRejectedError) {
      return { status: 'rejected', reason: e.reason };
    }

    throw e;
  }
}

export async function replaceWaypointsService(
  missionId: string,
  waypoints: Coordinate[],
): Promise<ReplaceWaypointsResult> {
  try {
    const { mission, savedWaypoints } = await prisma.$transaction(
      async (tx) => {
        const missionRow = await tx.mission.findUnique({
          where: { id: missionId },
          include: { waypoints: { orderBy: { order: 'asc' } } },
        });
        if (!missionRow) {
          throw new MissionRejectedError({
            code: 'MISSION_NOT_FOUND',
            message: 'Mission not found',
          });
        }

        const next = canReplaceWaypoints(mapMission(missionRow));
        if (next.status === 'rejected') {
          throw new MissionRejectedError(next.reason);
        }

        await tx.waypoint.deleteMany({ where: { missionId } });
        const savedWaypoints = await tx.waypoint.createManyAndReturn({
          data: waypoints.map((w, idx) => ({ missionId, order: idx, ...w })),
        });

        return { mission: mapMission(missionRow), savedWaypoints };
      },
    );

    return {
      status: 'success',
      mission: { ...mission, waypoints: mapWaypoints(savedWaypoints) },
    };
  } catch (e) {
    if (e instanceof MissionRejectedError) {
      return { status: 'rejected', reason: e.reason };
    }

    throw e;
  }
}

export async function startMissionService(
  missionId: string,
): Promise<StartMissionServiceResult> {
  try {
    const { updatedMission, droneRows } = await prisma.$transaction(
      async (tx) => {
        const missionRow = await tx.mission.findUnique({
          where: { id: missionId },
          include: { waypoints: { orderBy: { order: 'asc' } } },
        });
        if (!missionRow) {
          throw new MissionRejectedError({
            code: 'MISSION_NOT_FOUND',
            message: 'Mission not found',
          });
        }
        const droneRows = await tx.drone.findMany({ where: { missionId } });
        const zoneRows = await tx.geofence.findMany();
        const zones = GeofenceSchema.array().parse(zoneRows);
        if (!zones.length) {
          throw new Error('No geofences in database');
        }

        const next = startMission(
          mapMission(missionRow),
          mapDrones(droneRows),
          zones,
        );

        if (next.status === 'rejected') {
          throw new MissionRejectedError(next.reason);
        }

        const updatedMission = await tx.mission.update({
          where: { id: missionId },
          include: { waypoints: { orderBy: { order: 'asc' } } },
          data: next.mission,
        });

        return {
          updatedMission,
          droneRows,
        };
      },
    );

    const rejected: RejectedDrone[] = [];

    for (const droneRow of droneRows) {
      const result = await sendCommandService(mapDrone(droneRow), 'takeoff');

      if (result.status === 'rejected') {
        rejected.push({ droneId: droneRow.id, reason: result.reason });
      }
    }

    return {
      status: 'success',
      mission: mapMission(updatedMission),
      rejected,
    };
  } catch (e) {
    if (e instanceof MissionRejectedError) {
      return { status: 'rejected', reason: e.reason };
    }

    throw e;
  }
}

export async function abortMissionService(
  missionId: string,
): Promise<AbortMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
  });

  if (!missionRow) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    };
  }

  const droneRows = await prisma.drone.findMany({ where: { missionId } });

  const next = abortMission(mapMission(missionRow));
  if (next.status === 'rejected') {
    return next;
  }

  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
    data: next.mission,
  });

  const rejected: RejectedDrone[] = [];

  for (const droneRow of droneRows) {
    const result = await sendCommandService(mapDrone(droneRow), 'hold');

    if (result.status === 'rejected') {
      rejected.push({ droneId: droneRow.id, reason: result.reason });
    }
  }

  return {
    status: 'success',
    mission: mapMission(updatedMission),
    rejected,
  };
}

export async function restoreMissionService(
  missionId: string,
): Promise<RestoreMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
  });
  if (!missionRow) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    };
  }

  const next = restoreMission(mapMission(missionRow));
  if (next.status === 'rejected') {
    return next;
  }

  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
    data: next.mission,
  });

  return {
    status: 'success',
    mission: mapMission(updatedMission),
  };
}

export async function completeMissionService(
  missionId: string,
): Promise<CompleteMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
  });

  if (!missionRow) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    };
  }

  const next = completeMission(mapMission(missionRow));
  if (next.status === 'rejected') {
    return next;
  }

  const [updatedMission] = await prisma.$transaction([
    prisma.mission.update({
      where: { id: missionId },
      include: { waypoints: { orderBy: { order: 'asc' } } },
      data: next.mission,
    }),
    prisma.drone.updateMany({
      where: { missionId },
      data: { missionId: null },
    }),
  ]);

  return {
    status: 'success',
    mission: mapMission(updatedMission),
  };
}

export async function terminateMissionService(
  missionId: string,
): Promise<TerminateMissionServiceResult> {
  const missionRow = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { waypoints: { orderBy: { order: 'asc' } } },
  });

  if (!missionRow) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_NOT_FOUND',
        message: 'Mission not found',
      },
    };
  }

  const next = terminateMission(mapMission(missionRow));
  if (next.status === 'rejected') {
    return next;
  }

  const [updatedMission] = await prisma.$transaction([
    prisma.mission.update({
      where: { id: missionId },
      include: { waypoints: { orderBy: { order: 'asc' } } },
      data: next.mission,
    }),
    prisma.drone.updateMany({
      where: { missionId },
      data: { missionId: null },
    }),
  ]);

  return {
    status: 'success',
    mission: mapMission(updatedMission),
  };
}
