import { useMutation } from "@tanstack/react-query";
import { startMission } from "../api/startMission";
import { useMissionsStore } from "../stores/useMissionsStore";
import { useViolationsStore } from "../stores/useViolationsStore";

export const useStartMission = () => {
  return useMutation({
    mutationFn: (id: string) => startMission(id),
    onSuccess: (result, id) => {
      const store = useMissionsStore.getState();

      if (result.status === "rejected") {
        const mission = store.missions.find((m) => m.id === id);
        if (!mission) return;

        if (result.reason.code === "ROUTE_VIOLATES_ZONE") {
          useViolationsStore
            .getState()
            .setViolations(id, result.reason.violations, mission.waypoints);
        }

        return;
      }

      store.updateMission(result.mission);
    },
  });
};
