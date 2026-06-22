import type { Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchMissions(): Promise<Mission[]> {
  return apiFetch<Mission[]>("/missions");
}
