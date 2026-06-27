import { isPointInGeofence } from "@/contexts/geofence";
import { Coordinate } from "@uav/shared";

export function cross(o: Coordinate, a: Coordinate, b: Coordinate) {
  // Vector. We stand in o and look to a
  const oa = { x: a.lng - o.lng, y: a.lat - o.lat };
  // Vector. We stand in o and look to b
  const ob = { x: b.lng - o.lng, y: b.lat - o.lat };

  // Here we check where b is. To the left (+) or (-) to the right against oa
  return oa.x * ob.y - oa.y * ob.x;
}

export function segmentsIntersect(
  aStart: Coordinate,
  aEnd: Coordinate,
  bStart: Coordinate,
  bEnd: Coordinate,
): boolean {
  // left part and right the same sign it means line (a) doesn`t cross line (b)
  return (
    cross(aStart, aEnd, bStart) * cross(aStart, aEnd, bEnd) < 0 &&
    cross(bStart, bEnd, aStart) * cross(bStart, bEnd, aEnd) < 0
  );
}

export function segmentIntersectsPolygon(
  s: Coordinate,
  g: Coordinate,
  area: Coordinate[],
): boolean {
  if (isPointInGeofence(s, area) || isPointInGeofence(g, area)) {
    return true;
  }

  for (let i = 0; i < area.length; i++) {
    const a = area[i];
    const b = area[(i + 1) % area.length];

    if (segmentsIntersect(a, b, s, g)) {
      return true;
    }
  }

  return false;
}
