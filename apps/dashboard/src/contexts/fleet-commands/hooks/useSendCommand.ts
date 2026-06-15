import { useMutation } from "@tanstack/react-query";
import { sendCommand } from "@/contexts/fleet-commands";
import { useDronesStore } from "@/contexts/drones";
import type { CommandResult, DroneAction, Drone } from "@uav/shared";
import { predictDroneChange } from "@uav/shared";
import { useEffect, useRef } from "react";

type Vars = { id: string; action: DroneAction };

type Context = {
  snapshot: Partial<Drone> | undefined;
};

const CONFIRMATION_TIMEOUT_MS = 10_000;

export const useSendCommand = () => {
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return useMutation<CommandResult, Error, Vars, Context>({
    mutationFn: ({ id, action }: Vars) => sendCommand(id, action),

    onMutate: ({ id, action }) => {
      const store = useDronesStore.getState();

      const drone = store.serverDrones.find((d) => d.id === id);
      if (!drone) throw new Error("Drone not found in store");

      const prediction = predictDroneChange(action, drone.status);
      if (!prediction) {
        throw new Error(`Cannot ${action} drone in status "${drone.status}"`);
      }

      const snapshot = store.optimisticOverrides.get(id);
      store.applyOptimistic(id, prediction);
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

    onSuccess: (result, vars) => {
      if (result.status === "rejected") {
        const store = useDronesStore.getState();
        store.clearOptimistic(vars.id);
        return;
      }

      const existing = timeoutsRef.current.get(vars.id);
      if (existing) clearTimeout(existing);

      const timeoutId = setTimeout(() => {
        const store = useDronesStore.getState();
        const optimistic = store.optimisticOverrides.get(vars.id);

        if (optimistic) {
          console.warn(
            "[saga] Confirmation timeout (force clearing optimistic)",
          );
          store.clearOptimistic(vars.id);
        }

        timeoutsRef.current.delete(vars.id);
      }, CONFIRMATION_TIMEOUT_MS);

      timeoutsRef.current.set(vars.id, timeoutId);
    },
  });
};
