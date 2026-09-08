import { CompleteMissionServiceResultSchema } from "@uav/shared";
import { fetchOutcome } from "@/lib/apiFetch";

export async function completeMission(id: string) {
  return fetchOutcome(
    `/missions/${id}/complete`,
    CompleteMissionServiceResultSchema,
    {
      method: "POST",
    },
  );
}
