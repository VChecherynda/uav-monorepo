import { Coordinate, ZoneViolation } from "@uav/shared";
import { create } from "zustand";

type ViolationsState = {
  missionId: string | null;
  violations: ZoneViolation[];
  validatedWaypoints: Coordinate[] | null;

  setViolations: (
    missionId: string,
    violations: ZoneViolation[],
    validatedWaypoints: Coordinate[],
  ) => void;
};

export const useViolationsStore = create<ViolationsState>((set) => ({
  missionId: null,
  violations: [],
  validatedWaypoints: null,

  setViolations: (missionId, violations, validatedWaypoints) => {
    set({ missionId, violations, validatedWaypoints });
  },
}));
