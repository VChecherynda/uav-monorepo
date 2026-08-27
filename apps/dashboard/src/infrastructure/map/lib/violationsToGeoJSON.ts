import type { Coordinate, Drone, Geofence, ZoneViolation } from "@uav/shared";
import type { GeoJSONSourceSpecification } from "maplibre-gl";
import type { Feature } from "geojson";

const getMapCoordinate = ({ lng, lat }: Coordinate): [number, number] => {
  return [lng, lat];
};

export const violationsToGeoJSON = ({
  violations,
  waypoints,
  zones,
  drone,
}: {
  violations: ZoneViolation[];
  waypoints: Coordinate[];
  zones: Geofence[];
  drone: Drone;
}): GeoJSONSourceSpecification["data"] => {
  const zonesWithViolations = zones.filter((z) =>
    violations.some((v) => v.zoneId === z.id),
  );

  return {
    type: "FeatureCollection",
    features: [
      ...violations.map((v): Feature => {
        if (v.kind === "segment") {
          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates:
                v.index > 0
                  ? [
                      getMapCoordinate(waypoints[v.index - 1]),
                      getMapCoordinate(waypoints[v.index]),
                    ]
                  : [
                      [drone.lng, drone.lat],
                      getMapCoordinate(waypoints[v.index]),
                    ],
            },
            properties: {},
          };
        }

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: getMapCoordinate(waypoints[v.index]),
          },
          properties: {},
        };
      }),
      ...zonesWithViolations.map(
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
    ],
  };
};
