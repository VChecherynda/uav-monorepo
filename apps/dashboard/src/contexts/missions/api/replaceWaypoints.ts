import type { Coordinate, Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function replaceWaypoints(
  id: string,
  waypoints: Coordinate[],
): Promise<{ status: "success"; mission: Mission }> {
  return apiFetch<{ status: "success"; mission: Mission }>(
    `/missions/${id}/waypoints`,
    {
      method: "PUT",
      body: JSON.stringify(waypoints),
    },
  );
}
