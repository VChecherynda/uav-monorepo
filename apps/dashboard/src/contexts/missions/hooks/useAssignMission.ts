import { useMutation } from "@tanstack/react-query";
import type { Mission } from "@uav/shared";
import { assignMission } from "../api/assignMission";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useAssignMission = () => {
  return useMutation<
    { status: "success"; mission: Mission },
    Error,
    { id: string; droneId: string }
  >({
    mutationFn: ({ id, droneId }) => assignMission(id, droneId),
    onSuccess: (result) => {
      const store = useMissionsStore.getState();
      store.updateMission(result.mission);
    },
  });
};
