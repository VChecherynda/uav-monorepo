import { Prisma } from '@prisma/client';
import type { Drone as PrismaDrone } from '@prisma/client';
import type { Waypoint as PrismaWaypoint } from '@prisma/client';
import {
  type Drone,
  type Mission,
  type Coordinate,
  FlightModeSchema,
  MissionStatusSchema,
  FlightPhaseSchema,
  DispositionSchema,
} from '@uav/shared';

const DRONE_LINK_TIMEOUT_MS = 6000;

export type MissionWithWaypoints = Prisma.MissionGetPayload<{
  include: { waypoints: true };
}>;

export function mapDrone(d: PrismaDrone): Drone {
  return {
    id: d.id,
    name: d.name,
    missionId: d.missionId,
    flightPhase: FlightPhaseSchema.parse(d.flightPhase),
    flightMode: FlightModeSchema.parse(d.flightMode),
    disposition: DispositionSchema.parse(d.disposition),
    link:
      Date.now() - d.updatedAt.getTime() > DRONE_LINK_TIMEOUT_MS
        ? 'OFFLINE'
        : 'ONLINE',
    battery: d.battery,
    altitude: d.altitude,
    lng: d.lng,
    lat: d.lat,
  };
}

export function mapMission(m: MissionWithWaypoints): Mission {
  return {
    id: m.id,
    name: m.name,
    waypoints: mapWaypoints(m.waypoints),
    status: MissionStatusSchema.parse(m.status),
    reason: m.reason,
  };
}

export function mapWaypoint(w: PrismaWaypoint): Coordinate {
  return {
    lng: w.lng,
    lat: w.lat,
  };
}

export function mapWaypoints(waypoints: PrismaWaypoint[]): Coordinate[] {
  return waypoints.map(mapWaypoint);
}

export function mapDrones(drones: PrismaDrone[]): Drone[] {
  return drones.map(mapDrone);
}

export function mapMissions(missions: MissionWithWaypoints[]): Mission[] {
  return missions.map(mapMission);
}
