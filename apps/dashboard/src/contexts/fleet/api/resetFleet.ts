import { apiFetch } from "@/lib/apiFetch";
import { DroneSchema, type Drone } from "@uav/shared";

export async function resetFleet(): Promise<Drone[]> {
  const data = await apiFetch<unknown>("/fleet/reset", {
    method: "POST",
  });
  return DroneSchema.array().parse(data);
}
