import { MissionSchema, type Mission } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

export async function fetchMissions(): Promise<Mission[]> {
  const data = await apiFetch<unknown>("/missions");
  return MissionSchema.array().parse(data);
}
