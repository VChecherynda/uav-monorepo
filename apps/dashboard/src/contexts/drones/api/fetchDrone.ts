import type { Drone } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchDrone(id: string): Promise<Drone> {
  return apiFetch<Drone>(`/drones/${id}`);
}
