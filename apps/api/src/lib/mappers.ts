import type { Drone as PrismaDrone } from "@prisma/client";
import type { Mission as PrismaMission } from "@prisma/client";
import type { Waypoint as PrismaWaypoint } from "@prisma/client";
import type { Drone, Mission, Coordinate } from "@uav/shared";

export function mapDrone(d: PrismaDrone): Drone {
  return {
    id: d.id,
    name: d.name,
    status: d.status as Drone["status"],
    battery: d.battery,
    altitude: d.altitude,
    lng: d.lng,
    lat: d.lat,
  };
}

export function mapMission(m: PrismaMission): Mission {
  return {
    id: m.id,
    name: m.name,
    droneId: m.droneId ?? undefined,
    status: m.status as Mission["status"],
    reason: m.reason ?? undefined,
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

export function mapMissions(missions: PrismaMission[]): Mission[] {
  return missions.map(mapMission);
}
