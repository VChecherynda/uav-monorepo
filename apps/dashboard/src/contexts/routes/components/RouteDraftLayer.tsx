"use client";

import { toGeoJSON, useMap } from "@/infrastructure/map";
import { useEffect } from "react";
import { useRouteDraftStore } from "../stores/useRouteDraftStore";
import type { MapMouseEvent, GeoJSONSource } from "maplibre-gl";

const SOURCE_ID = "route-draft";
const LINE_LAYER_ID = "route-draft-line";
const POINT_LAYER_ID = "route-draft-point";

export function RouteDraftLayer() {
  const map = useMap();
  const waypoints = useRouteDraftStore((s) => s.waypoints);

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
        "line-color": "#d29922",
        "line-dasharray": [10, 2.4],
        "line-width": 2,
      },
    });

    map.addLayer({
      id: POINT_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-color": "#0a0e14",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#d29922",
      },
    });

    const handleClick = (e: MapMouseEvent) => {
      const { addWaypoint, planningMissionId } = useRouteDraftStore.getState();
      if (planningMissionId === null) return;
      const { lng, lat } = e.lngLat.wrap();
      addWaypoint({ lng, lat });
    };

    map.on("click", handleClick);

    return () => {
      if (!map.getStyle()) return;
      map.off("click", handleClick);
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
