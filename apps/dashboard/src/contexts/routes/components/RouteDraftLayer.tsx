"use client";

import { toGeoJSON, useMap, useMapLayer } from "@/infrastructure/map";
import { useEffect } from "react";
import { useRouteDraftStore } from "../stores/useRouteDraftStore";
import type { MapMouseEvent } from "maplibre-gl";

const SOURCE_ID = "route-draft";
const LINE_LAYER_ID = "route-draft-line";
const POINT_LAYER_ID = "route-draft-point";

export function RouteDraftLayer() {
  const map = useMap();
  const waypoints = useRouteDraftStore((s) => s.waypoints);

  const data = toGeoJSON(waypoints);

  useMapLayer({
    data,
    sourceId: SOURCE_ID,
    layers: [
      {
        id: LINE_LAYER_ID,
        type: "line",
        paint: {
          "line-color": "#d29922",
          "line-dasharray": [10, 2.4],
          "line-width": 2,
        },
      },
      {
        id: POINT_LAYER_ID,
        type: "circle",
        paint: {
          "circle-color": "#0a0e14",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#d29922",
        },
      },
    ],
  });

  useEffect(() => {
    const handleClick = (e: MapMouseEvent) => {
      const { addWaypoint, planningMissionId } = useRouteDraftStore.getState();
      if (planningMissionId === null) return;
      const { lng, lat } = e.lngLat.wrap();
      addWaypoint({ lng, lat });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map]);

  return null;
}
