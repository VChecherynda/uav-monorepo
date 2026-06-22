import { useMutation } from "@tanstack/react-query";
import { startMission } from "../api/startMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useStartMission = () => {
  return useMutation({
    mutationFn: (id: string) => startMission(id),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
  });
};
