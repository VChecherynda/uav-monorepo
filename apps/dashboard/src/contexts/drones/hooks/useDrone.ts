import { useQuery } from "@tanstack/react-query";
import { fetchDrone } from "@/contexts/drones/api/fetchDrone";

export function useDrone(id: string | null) {
  return useQuery({
    queryKey: ["drones", id],
    queryFn: () => fetchDrone(id!),
    enabled: !!id,
    staleTime: 1000,
  });
}
