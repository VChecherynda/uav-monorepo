"use client";

import { zonesToGeoJSON, useMapLayer } from "@/infrastructure/map";
import { ZONES } from "../constants";

const SOURCE_ID = "geofence-zone";
const POLYGON_LAYER_ID = "geofence-zone-polygon";

export function GeofenceLayer() {
  const data = zonesToGeoJSON(ZONES);

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
