import { Coordinate } from "@uav/shared";
import { create } from "zustand";

type RouteDraftState = {
  planningMissionId: string | null;
  waypoints: Coordinate[];

  startPlanning: (missionId: string) => void;
  addWaypoint: (waypoint: Coordinate) => void;
  cancelPlanning: () => void;
};

export const useRouteDraftStore = create<RouteDraftState>((set) => ({
  planningMissionId: null,
  waypoints: [],

  startPlanning: (missionId) => {
    set({ planningMissionId: missionId, waypoints: [] });
  },

  addWaypoint: (waypoint) => {
    set((state) => ({
      waypoints: [...state.waypoints, waypoint],
    }));
  },

  cancelPlanning: () =>
    set({
      planningMissionId: null,
      waypoints: [],
    }),
}));
