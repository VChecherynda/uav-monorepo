import type {
  Mission,
  Geofence,
  Drone,
  MissionConflictReason,
  ZoneViolation,
} from '@uav/shared';
import { isPointInPolygon, segmentIntersectsPolygon } from '@uav/shared';

export const assignDrone = (
  mission: Pick<Mission, 'status'>,
  drone: Drone,
):
  | {
      status: 'success';
    }
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'draft') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can be assigned',
      },
    };
  }

  if (drone.missionId !== null) {
    return {
      status: 'rejected',
      reason: {
        code: 'DRONE_IS_NOT_READY',
        message: 'Drone is on another mission',
      },
    };
  }

  if (drone.disposition === 'EXPENDED') {
    return {
      status: 'rejected',
      reason: {
        code: 'DRONE_IS_NOT_READY',
        message: 'Drone is expended',
      },
    };
  }

  return {
    status: 'success',
  };
};

export const unassignDrone = (
  mission: Pick<Mission, 'status' | 'id'>,
  drone: Drone,
):
  | {
      status: 'success';
    }
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (drone.disposition === 'EXPENDED') {
    return {
      status: 'rejected',
      reason: {
        code: 'DRONE_IS_NOT_READY',
        message: 'Drone is expended',
      },
    };
  }

  if (mission.status !== 'draft') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can be unassigned',
      },
    };
  }

  if (drone.missionId !== mission.id) {
    return {
      status: 'rejected',
      reason: {
        code: 'DRONE_IS_NOT_ON_MISSION',
        message: 'Drone is not on this mission',
      },
    };
  }

  return {
    status: 'success',
  };
};

export type StartMissionPatch = {
  status: 'success';
  mission: Pick<Mission, 'status'>;
};

export type AbortMissionPatch = {
  status: 'success';
  mission: Pick<Mission, 'status'>;
};

export type RestoreMissionPatch = {
  status: 'success';
  mission: Pick<Mission, 'status'>;
};

export type TerminateMissionPatch = {
  status: 'success';
  mission: Pick<Mission, 'status'>;
};

export type CompleteMissionPatch = {
  status: 'success';
  mission: Pick<Mission, 'status'>;
};

export const canReplaceWaypoints = (
  mission: Mission,
):
  | { status: 'success' }
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'draft') {
    return {
      status: 'rejected',
      reason: {
        code: 'WAYPOINTS_CANNOT_BE_REPLACED',
        message: 'Waypoints can only be replaced while mission is draft',
      },
    };
  }

  return {
    status: 'success',
  };
};

export const startMission = (
  mission: Mission,
  drones: Drone[],
  zones: Geofence[],
):
  StartMissionPatch | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'draft') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_IS_NOT_DRAFT',
        message: 'Only draft missions can start',
      },
    };
  }

  if (!mission.waypoints.length) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_HAS_NO_WAYPOINTS',
        message: 'Mission should have waypoints',
      },
    };
  }

  if (drones.length === 0) {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_HAS_NO_DRONE',
        message: 'Mission has no assigned drone',
      },
    };
  }

  const violations: ZoneViolation[] = [];

  if (!drones[0]) {
    throw new Error("drone doesn't exist");
  }

  const route = [
    { lng: drones[0].lng, lat: drones[0].lat },
    ...mission.waypoints,
  ];

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (!zone) {
      continue;
    }

    for (let j = 0; j < mission.waypoints.length; j++) {
      const w = mission.waypoints[j];
      if (!w) {
        continue;
      }

      const result = isPointInPolygon(w, zone.area);
      if (result) {
        violations.push({ kind: 'waypoint', index: j, zoneId: zone.id });
      }
    }

    for (let j = 0; j < route.length - 1; j++) {
      const s = route[j];
      const g = route[j + 1];

      if (!s || !g) {
        continue;
      }

      const result = segmentIntersectsPolygon(s, g, zone.area);
      if (result) {
        violations.push({ kind: 'segment', index: j, zoneId: zone.id });
      }
    }
  }

  if (violations.length) {
    return {
      status: 'rejected',
      reason: {
        code: 'ROUTE_VIOLATES_ZONE',
        message: violations
          .map((v) => {
            const zoneName =
              zones.find((z) => z.id === v.zoneId)?.name ?? v.zoneId;

            if (v.kind === 'waypoint') {
              return `Waypoint ${v.index + 1} is inside zone ${zoneName}`;
            }

            return `Segment ${v.index + 1} crosses zone ${zoneName}`;
          })
          .join('; '),
        violations,
      },
    };
  }

  return {
    status: 'success',
    mission: { status: 'in-progress' },
  };
};

export const abortMission = (
  mission: Mission,
):
  AbortMissionPatch | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'in-progress') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_ABORTED',
        message: `Cannot abort mission in status "${mission.status}"`,
      },
    };
  }

  return {
    status: 'success',
    mission: { status: 'aborted' },
  };
};

export const completeMission = (
  mission: Mission,
):
  | CompleteMissionPatch
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'in-progress') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_IS_NOT_IN_PROGRESS',
        message: 'Only in-progress missions can be completed',
      },
    };
  }

  return {
    status: 'success',
    mission: { status: 'completed' },
  };
};

export const restoreMission = (
  mission: Mission,
):
  | RestoreMissionPatch
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'aborted') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_RESTORED',
        message: 'Only aborted missions can be restored',
      },
    };
  }

  return {
    status: 'success',
    mission: {
      status: 'draft',
    },
  };
};

export const terminateMission = (
  mission: Mission,
):
  | TerminateMissionPatch
  | { status: 'rejected'; reason: MissionConflictReason } => {
  if (mission.status !== 'aborted') {
    return {
      status: 'rejected',
      reason: {
        code: 'MISSION_CANNOT_BE_TERMINATED',
        message: 'Only aborted missions can be terminated',
      },
    };
  }

  return {
    status: 'success',
    mission: {
      status: 'terminated',
    },
  };
};
