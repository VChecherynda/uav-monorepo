import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchDrones } from "@/lib/api";

export function useDrones() {
  return useQuery({
    queryKey: ["drones"],
    queryFn: fetchDrones,
    refetchInterval: 2000,
    placeholderData: keepPreviousData,
  });
}
