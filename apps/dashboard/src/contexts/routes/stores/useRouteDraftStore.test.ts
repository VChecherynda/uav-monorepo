// 1. початковий стан: planningMissionId=null, waypoints=[]
// 2. startPlanning("m1") → режим on, waypoints=[]
// 3. addWaypoint ×2 → масив з 2 точок У ПОРЯДКУ додавання
//    (порядок = маршрут — твоє ж правило з orderBy)
// 4. startPlanning("m2") ПІСЛЯ addWaypoint → waypoints=[] (скидання!)
// 5. cancelPlanning → null + []
// 6. мутаційний: addWaypoint повертає НОВЕ посилання
//    (old !== new) — тест, що вбиває push-версію

import { describe, it, expect, beforeEach } from "vitest";
import { useRouteDraftStore } from "./useRouteDraftStore";

describe("useRouteDraftStore", () => {
  beforeEach(() => {
    useRouteDraftStore.setState({
      planningMissionId: null,
      waypoints: [],
    });
  });

  it("start planning resets waypoints and sets mission id", () => {
    useRouteDraftStore.getState().startPlanning("m1");

    const state = useRouteDraftStore.getState();
    expect(state.planningMissionId).toBe("m1");
    expect(state.waypoints).toEqual([]);
  });

  it("addWaypoint appends to the end preserving order", () => {
    const waypoint1 = { lng: 5, lat: 10 };
    const waypoint2 = { lng: 10, lat: 20 };

    useRouteDraftStore.getState().addWaypoint(waypoint1);
    useRouteDraftStore.getState().addWaypoint(waypoint2);

    const state = useRouteDraftStore.getState();
    expect(state.waypoints.length).toBe(2);
    expect(state.waypoints[0]).toEqual(waypoint1);
    expect(state.waypoints[1]).toEqual(waypoint2);
  });

  it("startPlanning clears waypoints from previous session", () => {
    useRouteDraftStore.getState().addWaypoint({ lng: 5, lat: 10 });
    useRouteDraftStore.getState().startPlanning("m2");

    const state = useRouteDraftStore.getState();
    expect(state.planningMissionId).toBe("m2");
    expect(state.waypoints).toEqual([]);
  });

  it("cancelPlanning resets mission id and waypoints", () => {
    useRouteDraftStore.getState().addWaypoint({ lng: 5, lat: 10 });
    useRouteDraftStore.getState().startPlanning("m3");

    useRouteDraftStore.getState().cancelPlanning();
    const state = useRouteDraftStore.getState();

    expect(state.planningMissionId).toBe(null);
    expect(state.waypoints).toEqual([]);
  });

  it("addWaypoint creates new array reference for subscribers", () => {
    useRouteDraftStore.getState().addWaypoint({ lng: 5, lat: 10 });
    const oldWaypoints = useRouteDraftStore.getState().waypoints;

    useRouteDraftStore.getState().addWaypoint({ lng: 10, lat: 20 });
    const newWaypoints = useRouteDraftStore.getState().waypoints;

    expect(oldWaypoints).not.toBe(newWaypoints);
  });
});
