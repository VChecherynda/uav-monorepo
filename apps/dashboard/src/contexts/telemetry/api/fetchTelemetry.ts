import { TelemetrySchema, type Telemetry } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchTelemetry(droneId: string): Promise<Telemetry[]> {
  const data = await apiFetch<unknown>(`/drones/${droneId}/telemetry`);
  return TelemetrySchema.array().parse(data);
}
