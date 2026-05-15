import { fetchTelemetry } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useTelemetry = (droneId: string | null) => {
  return useQuery({
    queryKey: ["telemetry", droneId],
    queryFn: () => fetchTelemetry(droneId!),
    refetchInterval: 5000,
    enabled: !!droneId,
  });
};
