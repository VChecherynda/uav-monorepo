import { GeofenceSchema, type Geofence } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchGeofences(): Promise<Geofence[]> {
  const data = await apiFetch<unknown>("/geofences");
  return GeofenceSchema.array().parse(data);
}
