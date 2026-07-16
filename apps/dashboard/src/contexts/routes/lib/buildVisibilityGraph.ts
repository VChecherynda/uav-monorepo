import type { Coordinate, Geofence } from "@uav/shared";
import { isPointInPolygon, segmentIntersectsPolygon } from "@uav/shared";
import { AdjacencyList } from "./findRoute";

function intersectsAnyZone(
  u: Coordinate,
  v: Coordinate,
  zones: Geofence[],
): boolean {
  for (let i = 0; i < zones.length; i++) {
    if (segmentIntersectsPolygon(u, v, zones[i].area)) {
      return true;
    }
  }

  return false;
}

function isInsideAnyZone(
  c: Coordinate,
  zoneId: string,
  zones: Geofence[],
): boolean {
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (zoneId === zone.id) {
      continue;
    }

    if (isPointInPolygon(c, zone.area)) {
      return true;
    }
  }

  return false;
}

export function buildVisibilityGraph(
  s: Coordinate,
  g: Coordinate,
  zones: Geofence[],
): AdjacencyList {
  const coords = new Map<string, Coordinate>();
  const graph: AdjacencyList = {};

  coords.set("S", s);
  coords.set("G", g);

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (!zone) {
      continue;
    }

    for (let j = 0; j < zone.area.length; j++) {
      const c = zone.area[j];
      if (isInsideAnyZone(c, zone.id, zones)) {
        continue;
      }
      coords.set(`corner-${zone.id}-${j}`, c);
    }
  }

  const names = Array.from(coords.keys());
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const fromName = names[i];
      const toName = names[j];
      const coordU = coords.get(fromName);
      const coordV = coords.get(toName);

      if (!coordU || !coordV) continue;
      if (intersectsAnyZone(coordU, coordV, zones)) continue;

      const dx = coordV.lng - coordU.lng;
      const dy = coordV.lat - coordU.lat;
      const weight = Math.sqrt(dx * dx + dy * dy);

      graph[fromName] ??= [];
      graph[fromName].push({ id: toName, weight });

      graph[toName] ??= [];
      graph[toName].push({ id: fromName, weight });
    }
  }

  return graph;
}
