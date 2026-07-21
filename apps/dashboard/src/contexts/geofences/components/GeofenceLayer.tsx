"use client";

import { zonesToGeoJSON, useMapLayer } from "@/infrastructure/map";
import { useGeofences } from "../hooks/useGeofences";

const SOURCE_ID = "geofence-zone";
const POLYGON_LAYER_ID = "geofence-zone-polygon";

export function GeofenceLayer() {
  const zones = useGeofences();
  const data = zonesToGeoJSON(zones);

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
    ],
  });

  return null;
}
