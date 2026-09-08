import { StartMissionServiceResultSchema } from "@uav/shared";
import { fetchOutcome } from "@/lib/apiFetch";

export async function startMission(id: string) {
  return fetchOutcome(
    `/missions/${id}/start`,
    StartMissionServiceResultSchema,
    {
      method: "POST",
    },
  );
}
