import { z } from "zod";

export const GeofenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  area: z.array(z.object({ lng: z.number(), lat: z.number() })),
});

export type Geofence = z.infer<typeof GeofenceSchema>;
