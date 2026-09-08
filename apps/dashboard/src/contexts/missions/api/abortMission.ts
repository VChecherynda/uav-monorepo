import { AbortMissionServiceResultSchema } from "@uav/shared";
import { fetchOutcome } from "@/lib/apiFetch";

export async function abortMission(id: string) {
  return fetchOutcome(
    `/missions/${id}/abort`,
    AbortMissionServiceResultSchema,
    {
      method: "POST",
    },
  );
}
