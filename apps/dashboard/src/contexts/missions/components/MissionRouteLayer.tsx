"use client";

import { toGeoJSON, useMapLayer } from "@/infrastructure/map";
import { useMissionsStore } from "../stores/useMissionsStore";
import type { Coordinate } from "@uav/shared";

const EMPTY: Coordinate[] = [];
const SOURCE_ID = "mission-route";
const LINE_LAYER_ID = "mission-route-line";
const POINT_LAYER_ID = "mission-route-point";

export function MissionRouteLayer() {
  const waypoints = useMissionsStore(
    (s) =>
      s.missions.find((m) => m.id === s.selectedMissionId)?.waypoints ?? EMPTY,
  );

  const data = toGeoJSON(waypoints);

  useMapLayer({
    data,
    sourceId: SOURCE_ID,
    layers: [
      {
        id: LINE_LAYER_ID,
        type: "line",
        paint: {
          "line-color": "#58a6ff",
          "line-width": 2,
        },
      },
      {
        id: POINT_LAYER_ID,
        type: "circle",
        paint: {
          "circle-color": "#58a6ff",
          "circle-radius": 4,
        },
      },
    ],
  });

  return null;
}
