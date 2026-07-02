import { isPointInPolygon } from "@/contexts/geofence";
import { sub, crossVec } from "@uav/shared";
import type { Coordinate } from "@uav/shared";

export function collectCrossings(
  s: Coordinate,
  g: Coordinate,
  area: Coordinate[],
): number[] {
  const crossingTs: number[] = [];
  const d = sub(g, s);

  for (let i = 0; i < area.length; i++) {
    const a = area[i];
    const b = area[(i + 1) % area.length];

    const e = sub(b, a);
    const as = sub(a, s);

    const denom = crossVec(d, e);
    if (denom === 0) {
      continue;
    }

    const t = crossVec(as, e) / denom;
    const u = crossVec(as, d) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      crossingTs.push(t);
    }
  }

  return crossingTs;
}

export function segmentIntersectsPolygon(
  s: Coordinate,
  g: Coordinate,
  area: Coordinate[],
): boolean {
  const crossingTs = collectCrossings(s, g, area);
  const sortedTs = [0, ...crossingTs, 1].sort((a, b) => a - b);
  const d = sub(g, s);

  for (let i = 0; i < sortedTs.length - 1; i++) {
    const t1 = sortedTs[i];
    const t2 = sortedTs[i + 1];

    const tMid = (t1 + t2) / 2;
    const lng = s.lng + tMid * d.x;
    const lat = s.lat + tMid * d.y;

    if (isPointInPolygon({ lng, lat }, area)) {
      return true;
    }
  }

  return false;
}
