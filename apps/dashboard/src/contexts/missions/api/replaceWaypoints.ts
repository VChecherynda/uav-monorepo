import type { Coordinate } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function replaceWaypoints(
  id: string,
  waypoints: Coordinate[],
): Promise<Coordinate[]> {
  return apiFetch<Coordinate[]>(`/missions/${id}/waypoints`, {
    method: "PUT",
    body: JSON.stringify(waypoints),
  });
}
