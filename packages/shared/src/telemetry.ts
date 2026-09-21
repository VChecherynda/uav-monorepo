import { z } from 'zod';

export const TelemetrySchema = z.object({
  id: z.string(),
  droneId: z.string(),
  battery: z.number(),
  altitude: z.number(),
  lng: z.number(),
  lat: z.number(),
  recordedAt: z.coerce.date(),
});

export type Telemetry = z.infer<typeof TelemetrySchema>;
