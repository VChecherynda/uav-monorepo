import { describe, it, expect } from "vitest";
import { buildVisibilityGraph } from "./buildVisibilityGraph";
import type { Coordinate, Geofence } from "@uav/shared";
import type { Edge } from "./findRoute";

const ZONE: Geofence = {
  id: "z1",
  name: "SQUARE",
  area: [
    { lng: 0, lat: 0 }, // corner-0
    { lng: 10, lat: 0 }, // corner-1
    { lng: 10, lat: 10 }, // corner-2
    { lng: 0, lat: 10 }, // corner-3
  ],
};

const ZONE_RIGHT: Geofence = {
  id: "z2",
  name: "ZONE_RIGHT",
  area: [
    { lng: 20, lat: 0 }, // corner-0
    { lng: 30, lat: 0 }, // corner-1
    { lng: 30, lat: 10 }, // corner-2
    { lng: 20, lat: 10 }, // corner-3
  ],
};

const INNER: Geofence = {
  id: "z3",
  name: "INNER",
  area: [
    { lng: 4, lat: 4 }, // corner-0
    { lng: 8, lat: 4 }, // corner-1
    { lng: 8, lat: 8 }, // corner-2
    { lng: 4, lat: 8 }, // corner-3
  ],
};

const S: Coordinate = { lng: -5, lat: 5 };
const G: Coordinate = { lng: 35, lat: 5 };

const hasEdge = (edges: Edge[] | undefined, id: string): boolean =>
  (edges ?? []).some((e) => e.id === id);

describe("buildVisibilityGraph", () => {
  it("no S-G edge when the straight path cuts through the zone interior", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE]);

    expect(hasEdge(graph["S"], "G")).toBe(false);
  });

  it("keeps detour edges so G stays reachable arount the zone", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE]);

    expect(hasEdge(graph["S"], "corner-z1-0")).toBe(true);
    expect(hasEdge(graph["S"], "corner-z1-3")).toBe(true);
    expect(hasEdge(graph["G"], "corner-z1-2")).toBe(true);
    expect(hasEdge(graph["G"], "corner-z1-1")).toBe(true);
  });

  it("weight of the euclidian distance between endpoints", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE]);
    const edge = graph["S"].find((e) => e.id === "corner-z1-0");

    expect(edge).toBeDefined();
    expect(edge?.weight).toBe(Math.sqrt(50));
  });

  it("is symetric: every u->v edge has a v->u edge with equal weight", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE]);
    for (const [from, edges] of Object.entries(graph)) {
      for (const edge of edges) {
        const back = graph[edge.id]?.find((e) => e.id === from);
        expect(back).toBeDefined();
        expect(back?.weight).toBeCloseTo(edge.weight);
      }
    }
  });

  it("no corner-z1-0 corner-z1-2 diagonal edge through the zone interior", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE]);
    expect(hasEdge(graph["corner-z1-0"], "corner-z1-2")).toBe(false);
  });

  // NOTE: guarded by BOTH vertex filter and edge filter —
  // stays green if either one survives
  it("drops corners that lie inside another zone", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE, INNER]);
    expect(hasEdge(graph["S"], "corner-z1-3")).toBe(true);
    expect(hasEdge(graph["corner-z1-2"], "corner-z1-3")).toBe(true);

    const z2Keys = Object.keys(graph).filter((k) => k.includes("corner-z3-"));
    expect(z2Keys).toEqual([]);
  });

  it("corner keys are namespaced per zone — one zone cannot overwrite another", () => {
    const graph = buildVisibilityGraph(S, G, [ZONE, ZONE_RIGHT]);

    const z1Keys = Object.keys(graph).filter((k) => k.includes("corner-z1-"));
    const z2Keys = Object.keys(graph).filter((k) => k.includes("corner-z2-"));

    expect(z1Keys.length).toBe(4);
    expect(z2Keys.length).toBe(4);
  });
});
