import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchDrones, fetchDrone } from "@/lib/api";

export function useDrone(id: string | null) {
  return useQuery({
    queryKey: ["drones", id],
    queryFn: () => fetchDrone(id!),
    enabled: !!id,
    staleTime: 1000,
  });
}

export function useDrones() {
  return useQuery({
    queryKey: ["drones"],
    queryFn: fetchDrones,
    refetchInterval: 2000,
    placeholderData: keepPreviousData,
  });
}
