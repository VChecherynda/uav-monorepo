import { useMutation } from "@tanstack/react-query";
import { resetFleet } from "@/contexts/fleet";
import { useDronesStore } from "@/contexts/drones";

export const useResetFleet = () => {
  return useMutation({
    mutationFn: resetFleet,
    onSuccess: (drones) => {
      const store = useDronesStore.getState();
      store.setServerDrones(drones);
      store.clearAllOptimistic();
    },
  });
};
