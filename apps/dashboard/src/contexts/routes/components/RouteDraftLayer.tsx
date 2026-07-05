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

export function RouteDraftLayer() {
  const map = useMap();
  const waypoints = useRouteDraftStore((s) => s.waypoints);

  useEffect(() => {
    map.addSource("route-draft", {
      type: "geojson",
      data: toGeoJSON([]),
    });

    map.addLayer({
      id: "route-draft-line",
      type: "line",
      source: "route-draft",
      paint: {
        "line-color": "#58a6ff",
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
      map.removeLayer("route-draft-line");
      map.removeSource("route-draft");
    };
  }, [map]);

  useEffect(() => {
    const source = map.getSource("route-draft") as GeoJSONSource;
    if (!source) return;

    source.setData(toGeoJSON(waypoints));
  }, [map, waypoints]);

  return null;
}
