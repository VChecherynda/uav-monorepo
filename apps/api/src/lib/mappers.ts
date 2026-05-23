import type { Drone as PrismaDrone } from "@prisma/client";
import type { Drone } from "@uav/shared";

export function mapDrone(d: PrismaDrone) {
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

export function mapDrones(drones: PrismaDrone[]): Drone[] {
  return drones.map(mapDrone);
}
