"use client";

import { toGeoJSON, useMap } from "@/infrastructure/map";
import { useEffect } from "react";
import { useMissionsStore } from "../stores/useMissionsStore";
import type { GeoJSONSource } from "maplibre-gl";
import type { Coordinate } from "@uav/shared";

const EMPTY: Coordinate[] = [];
const SOURCE_ID = "mission-route";
const LINE_LAYER_ID = "mission-route-line";
const POINT_LAYER_ID = "mission-route-point";

export function MissionRouteLayer() {
  const map = useMap();
  const waypoints = useMissionsStore(
    (s) =>
      s.missions.find((m) => m.id === s.selectedMissionId)?.waypoints ?? EMPTY,
  );

  useEffect(() => {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: toGeoJSON([]),
    });

    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      paint: {
        "line-color": "#58a6ff",
        "line-width": 2,
      },
    });

    map.addLayer({
      id: POINT_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-color": "#58a6ff",
        "circle-radius": 4,
      },
    });

    return () => {
      if (!map.getStyle()) return;
      map.removeLayer(LINE_LAYER_ID);
      map.removeLayer(POINT_LAYER_ID);
      map.removeSource(SOURCE_ID);
    };
  }, [map]);

  useEffect(() => {
    const source = map.getSource(SOURCE_ID) as GeoJSONSource;
    if (!source) return;

    source.setData(toGeoJSON(waypoints));
  }, [map, waypoints]);

  return null;
}
