import { useMutation } from "@tanstack/react-query";
import { assignMission } from "../api/assignMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useAssignMission = () => {
  return useMutation({
    mutationFn: ({ id, droneId }: { id: string; droneId: string }) =>
      assignMission(id, droneId),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();

      if (result.status !== "success") {
        return;
      }
      store.updateMission(result.mission);
    },
  });
};
