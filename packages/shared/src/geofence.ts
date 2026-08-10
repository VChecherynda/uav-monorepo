import { z } from "zod";
import { CoordinateSchema } from "./geometry.js";

export const GeofenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: z.array(CoordinateSchema),
});

export type Geofence = z.infer<typeof GeofenceSchema>;
