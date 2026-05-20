import { apiFetch } from "@/lib/apiFetch";

export type DroneAction = "return-home" | "land" | "takeoff";

export async function sendCommand(id: string, action: DroneAction) {
  return apiFetch<{ ok: boolean }>(`/drones/${id}/command`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
