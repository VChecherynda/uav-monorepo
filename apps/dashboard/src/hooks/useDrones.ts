import { useQuery } from "@tanstack/react-query";
import { fetchDrone } from "@/lib/api";

export function useDrone(id: string | null) {
  return useQuery({
    queryKey: ["drones", id],
    queryFn: () => fetchDrone(id!),
    enabled: !!id,
    staleTime: 1000,
  });
}
