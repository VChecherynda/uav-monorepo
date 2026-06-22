import { useMutation } from "@tanstack/react-query";
import { abortMission } from "../api/abortMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useAbortMission = () => {
  return useMutation({
    mutationFn: (id: string) => abortMission(id),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
  });
};
