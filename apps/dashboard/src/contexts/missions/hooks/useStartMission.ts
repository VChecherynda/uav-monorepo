import { useMutation } from "@tanstack/react-query";
import { startMission } from "../api/startMission";
import { useMissionsStore } from "../stores/useMissionsStore";
import { RouteViolatesZoneSchema } from "@uav/shared";
import { ResponseError } from "@/lib/apiFetch";
import { useViolationsStore } from "../stores/useViolationsStore";

export const useStartMission = () => {
  return useMutation({
    mutationFn: (id: string) => startMission(id),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
    onError: (err, id: string) => {
      if (err instanceof ResponseError) {
        const result = RouteViolatesZoneSchema.safeParse(err.reason);
        if (result.success) {
          useViolationsStore
            .getState()
            .setViolations(id, result.data.violations);
        }
      }
    },
  });
};
