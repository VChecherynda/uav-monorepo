import { useMutation } from "@tanstack/react-query";
import { completeMission } from "../api/completeMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useCompleteMission = () => {
  return useMutation({
    mutationFn: (id: string) => completeMission(id),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
  });
};
