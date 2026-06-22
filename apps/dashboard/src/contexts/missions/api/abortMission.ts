import type { Drone, Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function abortMission(id: string): Promise<{
  status: "success";
  mission: Mission;
  drone: Drone;
}> {
  return apiFetch<{ status: "success"; mission: Mission; drone: Drone }>(
    `/missions/${id}/abort`,
    {
      method: "POST",
    },
  );
}
