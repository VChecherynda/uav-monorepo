import { create } from "zustand";
import { Drone } from "@uav/shared";

type DronesState = {
  serverDrones: Drone[];
  optimisticOverrides: Map<string, Partial<Drone>>;

  setServerDrones: (drones: Drone[]) => void;
  applyOptimistic: (droneId: string, changes: Partial<Drone>) => void;
  clearOptimistic: (droneId: string) => void;
};

export const useDronesStore = create<DronesState>((set) => ({
  serverDrones: [],
  optimisticOverrides: new Map(),

  setServerDrones: (drones) =>
    set((state) => {
      const nextOverrides = new Map(state.optimisticOverrides);

      drones.forEach((d) => {
        const override = nextOverrides.get(d.id);
        if (!override) return;

        const allFieldsMatch = Object.entries(override).every(
          ([key, value]) => d[key as keyof Drone] === value,
        );

        if (allFieldsMatch) {
          nextOverrides.delete(d.id);
        }
      });

      return {
        serverDrones: drones,
        optimisticOverrides: nextOverrides,
      };
    }),

  applyOptimistic: (droneId, changes) => {
    set((state) => {
      const next = new Map(state.optimisticOverrides);
      next.set(droneId, changes);
      return { optimisticOverrides: next };
    });
  },

  clearOptimistic: (droneId: string) => {
    set((state) => {
      const next = new Map(state.optimisticOverrides);
      next.delete(droneId);
      return { optimisticOverrides: next };
    });
  },
}));
