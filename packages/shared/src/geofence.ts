import type { Coordinate } from "./geometry.js";

export type Geofence = {
  id: string;
  name: string;
  area: Coordinate[];
};
