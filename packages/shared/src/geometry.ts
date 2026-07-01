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
