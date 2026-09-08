import { type Coordinate, ReplaceWaypointsResultSchema } from "@uav/shared";
import { fetchOutcome } from "@/lib/apiFetch";

export async function replaceWaypoints(id: string, waypoints: Coordinate[]) {
  return fetchOutcome(
    `/missions/${id}/waypoints`,
    ReplaceWaypointsResultSchema,
    {
      method: "PUT",
      body: JSON.stringify(waypoints),
    },
  );
}
