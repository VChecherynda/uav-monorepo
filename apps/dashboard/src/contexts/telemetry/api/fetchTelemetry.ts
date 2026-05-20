import type { Telemetry } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchTelemetry(droneId: string): Promise<Telemetry[]> {
  return apiFetch<Telemetry[]>(`/drones/${droneId}/telemetry`);
}
