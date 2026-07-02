import { Coordinate, cross } from "@uav/shared";

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
