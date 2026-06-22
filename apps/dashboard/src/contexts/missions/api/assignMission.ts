import type { Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function assignMission(
  id: string,
  droneId: string,
): Promise<{
  status: "success";
  mission: Mission;
}> {
  return apiFetch<{ status: "success"; mission: Mission }>(
    `/missions/${id}/assign`,
    {
      method: "POST",
      body: JSON.stringify({ droneId }),
    },
  );
}
