"use client";

import { toGeoJSON, useMap } from "@/infrastructure/map";
import { useEffect } from "react";
import { useMissionsStore } from "../stores/useMissionsStore";
import type { GeoJSONSource } from "maplibre-gl";
import type { Coordinate } from "@uav/shared";

const EMPTY: Coordinate[] = [];
const SOURCE_ID = "mission-route";
const LAYER_ID = "mission-route-line";

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
      id: LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      paint: {
        "line-color": "#58a6ff",
        "line-width": 2,
      },
    });

    return () => {
      map.removeLayer(LAYER_ID);
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
