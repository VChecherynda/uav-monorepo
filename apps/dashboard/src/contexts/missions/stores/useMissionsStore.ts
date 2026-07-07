import { create } from "zustand";
import type { Mission } from "@uav/shared";

type MissionsState = {
  missions: Mission[];
  selectedMissionId: string | null;

  setMissions: (missions: Mission[]) => void;
  updateMission: (mission: Mission) => void;
  selectMission: (id: string) => void;
};

export const useMissionsStore = create<MissionsState>((set) => ({
  missions: [],
  selectedMissionId: null,

  setMissions: (missions) => {
    set({ missions });
  },

  updateMission: (mission) => {
    set((state) => ({
      missions: state.missions.map((m) => (m.id === mission.id ? mission : m)),
    }));
  },

  selectMission: (id) => {
    set((s) => ({
      selectedMissionId: s.selectedMissionId === id ? null : id,
    }));
  },
}));
