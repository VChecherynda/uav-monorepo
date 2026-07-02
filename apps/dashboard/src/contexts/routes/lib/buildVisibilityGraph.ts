import type { Coordinate } from "@uav/shared";
import { segmentIntersectsPolygon } from "@uav/shared";
import { AdjacencyList } from "./findRoute";

export function buildVisibilityGraph(
  s: Coordinate,
  g: Coordinate,
  area: Coordinate[],
): AdjacencyList {
  const coords = new Map<string, Coordinate>();
  const graph: AdjacencyList = {};

  coords.set("S", s);
  coords.set("G", g);

  area.forEach((c, idx) => {
    coords.set(`corner-${idx}`, c);
  });

  const names = Array.from(coords.keys());
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const fromName = names[i];
      const toName = names[j];
      const coordU = coords.get(fromName);
      const coordV = coords.get(toName);

      if (!coordU || !coordV) continue;
      if (segmentIntersectsPolygon(coordU, coordV, area)) continue;

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
