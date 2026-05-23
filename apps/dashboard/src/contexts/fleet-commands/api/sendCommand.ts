import { apiFetch } from "@/lib/apiFetch";
import { CommandResult, DroneAction } from "@uav/shared";

export async function sendCommand(
  id: string,
  action: DroneAction,
): Promise<CommandResult> {
  return apiFetch<CommandResult>(`/drones/${id}/command`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
