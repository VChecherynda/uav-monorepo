import { useMemo } from "react";
import { useDronesStore } from "@/contexts/drones";

export function useDrones() {
  const serverDrones = useDronesStore((s) => s.serverDrones);
  const optimisticOverrides = useDronesStore((s) => s.optimisticOverrides);

  return useMemo(
    () =>
      serverDrones.map((drone) => {
        const override = optimisticOverrides.get(drone.id);
        return override ? { ...drone, ...override } : drone;
      }),
    [serverDrones, optimisticOverrides],
  );
}
