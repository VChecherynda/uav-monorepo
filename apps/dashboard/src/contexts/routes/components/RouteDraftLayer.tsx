"use client";

import { useMap } from "@/infrastructure/map";
import { useEffect } from "react";
import { useRouteDraftStore } from "../stores/useRouteDraftStore";
import type {
  MapMouseEvent,
  GeoJSONSourceSpecification,
  GeoJSONSource,
} from "maplibre-gl";
import type { Coordinate } from "@uav/shared";

const toGeoJSON = (
  waypoints: Coordinate[],
): GeoJSONSourceSpecification["data"] => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: waypoints.map((w) => [w.lng, w.lat]),
  },
  properties: {},
});

const SOURCE_ID = "route-draft";
const LAYER_ID = "route-draft-line";

export function RouteDraftLayer() {
  const map = useMap();
  const waypoints = useRouteDraftStore((s) => s.waypoints);

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
        "line-dasharray": [10, 2.4],
        "line-width": 2,
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
      map.off("click", handleClick);
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
