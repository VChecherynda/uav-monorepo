import type { Drone, Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function completeMission(id: string): Promise<{
  status: "success";
  mission: Mission;
  drone: Drone;
}> {
  return apiFetch<{ status: "success"; mission: Mission; drone: Drone }>(
    `/missions/${id}/complete`,
    {
      method: "POST",
    },
  );
}
