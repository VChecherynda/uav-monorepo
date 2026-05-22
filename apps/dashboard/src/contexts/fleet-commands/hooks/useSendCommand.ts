import { useMutation } from "@tanstack/react-query";
import {
  sendCommand,
  type DroneAction,
} from "@/contexts/fleet-commands/api/sendCommand";
import { useDronesStore } from "@/contexts/drones";
import { Drone } from "@uav/shared";
import { predictDroneChange } from "../lib/predictDroneChange";

type Vars = { id: string; action: DroneAction };

type Context = {
  snapshot: Partial<Drone> | undefined;
};

export const useSendCommand = () => {
  return useMutation<unknown, Error, Vars, Context>({
    mutationFn: ({ id, action }: Vars) => sendCommand(id, action),

    onMutate: ({ id, action }) => {
      const store = useDronesStore.getState();
      const snapshot = store.optimisticOverrides.get(id);

      store.applyOptimistic(id, predictDroneChange(action));

      return { snapshot };
    },

    onError: (_err, vars, context) => {
      const store = useDronesStore.getState();

      if (context?.snapshot) {
        store.applyOptimistic(vars.id, context.snapshot);
      } else {
        store.clearOptimistic(vars.id);
      }
    },
  });
};
