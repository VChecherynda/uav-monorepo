export type Coordinate = {
  lng: number;
  lat: number;
};

export type Vec = {
  x: number;
  y: number;
};

export function cross(o: Coordinate, a: Coordinate, b: Coordinate) {
  // Vector. We stand in o and look to a
  const oa = { x: a.lng - o.lng, y: a.lat - o.lat };
  // Vector. We stand in o and look to b
  const ob = { x: b.lng - o.lng, y: b.lat - o.lat };

  // Here we check where b is. To the left (+) or (-) to the right against oa
  return oa.x * ob.y - oa.y * ob.x;
}

export function sub(p: Coordinate, q: Coordinate): Vec {
  return { x: p.lng - q.lng, y: p.lat - q.lat };
}

export function crossVec(v: Vec, w: Vec): number {
  return v.x * w.y - v.y * w.x;
}

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

export function isPointInPolygon(p: Coordinate, area: Coordinate[]): boolean {
  let inside = false;

  for (let i = 0; i < area.length; i++) {
    const a = area[i];
    const b = area[(i + 1) % area.length];

    const onLine = cross(a, b, p) === 0;
    const betweenLng =
      p.lng >= Math.min(a.lng, b.lng) && p.lng <= Math.max(a.lng, b.lng);
    const betweenLat =
      p.lat >= Math.min(a.lat, b.lat) && p.lat <= Math.max(a.lat, b.lat);
    if (onLine && betweenLng && betweenLat) {
      return false;
    }
  }

  for (let i = 0; i < area.length; i++) {
    const a = area[i];
    const b = area[(i + 1) % area.length];

    // Check if p is betwenn a and b coordinate height ( lat )
    const heightOk = p.lat >= a.lat !== p.lat >= b.lat;
    if (!heightOk) {
      continue;
    }

    // check if ray cross the wall ( interpolation )
    const t = (p.lat - a.lat) / (b.lat - a.lat);
    const crossLng = a.lng + t * (b.lng - a.lng);

    if (crossLng > p.lng) {
      inside = !inside;
    }
  }

  return inside;
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
