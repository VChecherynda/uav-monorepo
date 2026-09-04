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
      ...violations.flatMap((v): Feature[] => {
        const currentWP = waypoints[v.index];
        if (!currentWP) return [];

        if (v.kind === "segment") {
          if (v.index > 0) {
            const prevWP = waypoints[v.index - 1];
            if (!prevWP) return [];

            return [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    getMapCoordinate(prevWP),
                    getMapCoordinate(currentWP),
                  ],
                },
                properties: {},
              },
            ];
          }

          return [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [drone.lng, drone.lat],
                  getMapCoordinate(currentWP),
                ],
              },
              properties: {},
            },
          ];
        }

        return [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: getMapCoordinate(currentWP),
            },
            properties: {},
          },
        ];
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
