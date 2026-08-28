"use client";

import { violationsToGeoJSON, useMapLayer } from "@/infrastructure/map";
import { useMissionsStore } from "../stores/useMissionsStore";
import { useViolationsStore } from "../stores/useViolationsStore";
import { useGeofences } from "@/contexts/geofences";
import { useDronesStore } from "@/contexts/drones";
import type { FeatureCollection } from "geojson";
import type { Coordinate } from "@uav/shared";

const EMPTY_DATA: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};
const EMPTY_COORDINATES: Coordinate[] = [];
const SOURCE_ID = "mission-violation";
const LINE_LAYER_ID = "mission-violation-line";
const POINT_LAYER_ID = "mission-violation-point";
const POLYGON_LAYER_ID = "mission-violation-polygon";
const OUTLINE_LAYER_ID = "mission-violation-outline";

export function MissionViolationLayer() {
  const { missionId, violations, validatedWaypoints } = useViolationsStore();

  const selectedMissionId = useMissionsStore((s) => s.selectedMissionId);
  const mission = useMissionsStore((s) =>
    s.missions.find((m) => m.id === missionId),
  );
  const drone = useDronesStore((s) =>
    s.serverDrones.find((d) => d.id === mission?.droneId),
  );

  const waypoints = mission?.waypoints ?? EMPTY_COORDINATES;

  const zones = useGeofences();

  const data =
    drone &&
    missionId === selectedMissionId &&
    mission?.waypoints === validatedWaypoints
      ? violationsToGeoJSON({ violations, waypoints, zones, drone })
      : EMPTY_DATA;

  useMapLayer({
    data,
    sourceId: SOURCE_ID,
    layers: [
      {
        id: POLYGON_LAYER_ID,
        type: "fill",
        paint: {
          "fill-color": "#e5534b",
          "fill-opacity": 0.4,
        },
      },
      {
        id: LINE_LAYER_ID,
        type: "line",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": "#e5534b",
          "line-width": 2,
        },
      },
      {
        id: POINT_LAYER_ID,
        type: "circle",
        paint: {
          "circle-color": "#e5534b",
          "circle-radius": 4,
        },
      },
      {
        id: OUTLINE_LAYER_ID,
        type: "line",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "line-color": "#e5534b",
        },
      },
    ],
  });

  return null;
}
