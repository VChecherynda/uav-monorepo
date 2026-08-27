import { ZoneViolation } from "@uav/shared";
import { create } from "zustand";

type ViolationsState = {
  missionId: string | null;
  violations: ZoneViolation[];

  setViolations: (missionId: string, violations: ZoneViolation[]) => void;
  clearViolations: () => void;
};

export const useViolationsStore = create<ViolationsState>((set) => ({
  missionId: null,
  violations: [],

  setViolations: (missionId, violations) => {
    set({ missionId, violations });
  },

  clearViolations: () =>
    set({
      missionId: null,
      violations: [],
    }),
}));
