import { useMutation } from "@tanstack/react-query";
import { replaceWaypoints } from "../api/replaceWaypoints";
import { useRouteDraftStore } from "@/contexts/routes";

export const useReplaceWaypoints = () => {
  return useMutation({
    mutationFn: (id: string) =>
      replaceWaypoints(id, useRouteDraftStore.getState().waypoints),
    onSuccess: () => {
      const store = useRouteDraftStore.getState();
      store.cancelPlanning();
    },
  });
};
