import { fetchOutcome } from "@/lib/apiFetch";
import { AssignResultSchema } from "@uav/shared";

export async function assignMission(id: string, droneId: string) {
  return fetchOutcome(`/missions/${id}/assign`, AssignResultSchema, {
    method: "POST",
    body: JSON.stringify({ droneId }),
  });
}
