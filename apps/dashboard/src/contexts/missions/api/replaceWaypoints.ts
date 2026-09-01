import type { Coordinate, ReplaceWaypointsResult } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

type ReplaceWaypointsSuccess = Extract<
  ReplaceWaypointsResult,
  { status: "success" }
>;

export async function replaceWaypoints(
  id: string,
  waypoints: Coordinate[],
): Promise<ReplaceWaypointsSuccess> {
  return apiFetch<ReplaceWaypointsSuccess>(`/missions/${id}/waypoints`, {
    method: "PUT",
    body: JSON.stringify(waypoints),
  });
}
