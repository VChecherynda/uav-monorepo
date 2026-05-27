import { apiFetch } from "@/lib/apiFetch";
import { Drone } from "@uav/shared";

export async function resetFleet(): Promise<Drone[]> {
  return apiFetch<Drone[]>("/fleet/reset", {
    method: "POST",
  });
}
