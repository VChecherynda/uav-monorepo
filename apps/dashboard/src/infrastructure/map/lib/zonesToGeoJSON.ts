import { Geofence } from "@uav/shared";
import { GeoJSONSourceSpecification } from "maplibre-gl";
import type { Feature } from "geojson";

export const zonesToGeoJSON = (
  zones: Geofence[],
): GeoJSONSourceSpecification["data"] => {
  return {
    type: "FeatureCollection",
    features: zones.map(
      (z): Feature => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [z.area.map((c): number[] => [c.lng, c.lat])],
        },
        properties: {
          id: z.id,
          name: z.name,
        },
      }),
    ),
  };
};
