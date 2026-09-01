import { useMutation } from "@tanstack/react-query";
import { replaceWaypoints } from "../api/replaceWaypoints";
import { useRouteDraftStore } from "@/contexts/routes";
import { useMissionsStore } from "../stores/useMissionsStore";

export const useReplaceWaypoints = () => {
  return useMutation({
    mutationFn: (id: string) =>
      replaceWaypoints(id, useRouteDraftStore.getState().waypoints),
    onSuccess: (result) => {
      useMissionsStore.getState().updateMission(result.mission);
      useRouteDraftStore.getState().cancelPlanning();
    },
  });
};
