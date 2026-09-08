import { RestoreMissionServiceResultSchema } from "@uav/shared";
import { fetchOutcome } from "@/lib/apiFetch";

export async function restoreMission(id: string) {
  return fetchOutcome(
    `/missions/${id}/restore`,
    RestoreMissionServiceResultSchema,
    {
      method: "POST",
    },
  );
}
