import { create } from "zustand";
import type { Mission } from "@uav/shared";

type MissionsState = {
  missions: Mission[];

  setMissions: (missions: Mission[]) => void;
  updateMission: (mission: Mission) => void;
};

export const useMissionsStore = create<MissionsState>((set) => ({
  missions: [],

  setMissions: (missions) => {
    set({ missions });
  },

  updateMission: (mission) => {
    set((state) => ({
      missions: state.missions.map((m) => (m.id === mission.id ? mission : m)),
    }));
  },
}));
