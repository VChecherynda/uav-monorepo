import { create } from "zustand";
import { Drone } from "@uav/shared";

type DronesState = {
  droneId: string | null;
  serverDrones: Drone[];
  optimisticOverrides: Map<string, Partial<Drone>>;

  selectDrone: (droneId: string) => void;
  setServerDrones: (drones: Drone[]) => void;
  applyOptimistic: (droneId: string, changes: Partial<Drone>) => void;
  clearOptimistic: (droneId: string) => void;
  clearAllOptimistic: () => void;
};

export const useDronesStore = create<DronesState>((set) => ({
  droneId: null,
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

  selectDrone: (droneId) => {
    set((state) => ({
      ...state,
      droneId,
    }));
  },

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

  clearAllOptimistic: () => {
    set({ optimisticOverrides: new Map() });
  },
}));
