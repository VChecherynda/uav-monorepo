import { Coordinate } from "@uav/shared";
import { GeoJSONSourceSpecification } from "maplibre-gl";
import type { Feature } from "geojson";

export const toGeoJSON = (
  waypoints: Coordinate[],
): GeoJSONSourceSpecification["data"] => {
  const coordinates = waypoints.map((w) => [w.lng, w.lat]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      },
      ...coordinates.map(
        (c): Feature => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: c,
          },
          properties: {},
        }),
      ),
    ],
  };
};
