import { useMutation } from "@tanstack/react-query";
import { restoreMission } from "../api/restoreMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useRestoreMission = () => {
  return useMutation({
    mutationFn: (id: string) => restoreMission(id),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
  });
};
