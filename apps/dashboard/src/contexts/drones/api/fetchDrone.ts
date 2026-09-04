import { DroneSchema, type Drone } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchDrone(id: string): Promise<Drone> {
  const data = await apiFetch<unknown>(`/drones/${id}`);
  return DroneSchema.parse(data);
}
