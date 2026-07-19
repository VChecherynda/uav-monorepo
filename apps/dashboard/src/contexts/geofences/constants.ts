import { Geofence } from "@uav/shared";

export const ZONES: Geofence[] = [
  {
    id: "zone-airport",
    name: "Alice Springs Airport",
    area: [
      { lng: 133.892, lat: -23.812 },
      { lng: 133.912, lat: -23.812 },
      { lng: 133.912, lat: -23.792 },
      { lng: 133.892, lat: -23.792 },
    ],
  },
  {
    id: "zone-restricted-north",
    name: "Restricted North",
    area: [
      { lng: 133.86, lat: -23.66 },
      { lng: 133.89, lat: -23.66 },
      { lng: 133.89, lat: -23.64 },
      { lng: 133.86, lat: -23.64 },
    ],
  },
];
