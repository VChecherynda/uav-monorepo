import type { Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function restoreMission(id: string): Promise<{
  status: "success";
  mission: Mission;
}> {
  return apiFetch<{ status: "success"; mission: Mission }>(
    `/missions/${id}/restore`,
    {
      method: "POST",
    },
  );
}
