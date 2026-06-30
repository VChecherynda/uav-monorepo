import { describe, it, expect } from "vitest";
import { buildVisibilityGraph } from "./buildVisibilityGraph";
import type { Coordinate } from "@uav/shared";
import type { Edge } from "./findRoute";

const SQUARE: Coordinate[] = [
  { lng: 0, lat: 0 }, // corner-0
  { lng: 10, lat: 0 }, // corner-1
  { lng: 10, lat: 10 }, // corner-2
  { lng: 0, lat: 10 }, // corner-3
];

const S: Coordinate = { lng: -5, lat: 5 };
const G: Coordinate = { lng: 15, lat: 5 };

const hasEdge = (edges: Edge[] | undefined, id: string): boolean =>
  (edges ?? []).some((e) => e.id === id);

describe("buildVisibilityGraph", () => {
  it("no S-G edge when the straight path cuts through the zone interior", () => {
    const graph = buildVisibilityGraph(S, G, SQUARE);

    expect(hasEdge(graph["S"], "G")).toBe(false);
  });

  it("keeps detour edges so G stays reachable arount the zone", () => {
    const graph = buildVisibilityGraph(S, G, SQUARE);

    expect(hasEdge(graph["S"], "corner-0")).toBe(true);
    expect(hasEdge(graph["S"], "corner-3")).toBe(true);
    expect(hasEdge(graph["G"], "corner-2")).toBe(true);
    expect(hasEdge(graph["G"], "corner-1")).toBe(true);
  });

  it("weight of the euclidian distance between endpoints", () => {
    const graph = buildVisibilityGraph(S, G, SQUARE);
    const edge = graph["S"].find((e) => e.id === "corner-0");

    expect(edge?.weight).toBe(Math.sqrt(50));
  });

  it("is symetric: every u->v edge has a v->u edge with equal weight", () => {
    const graph = buildVisibilityGraph(S, G, SQUARE);
    for (const [from, edges] of Object.entries(graph)) {
      for (const edge of edges) {
        const back = graph[edge.id]?.find((e) => e.id === from);
        expect(back).toBeDefined();
        expect(back?.weight).toBeCloseTo(edge.weight);
      }
    }
  });

  it("no corner-0-corner-2 diagonal edge through the zone interior", () => {
    const graph = buildVisibilityGraph(S, G, SQUARE);
    expect(hasEdge(graph["corner-0"], "corner-2")).toBe(false);
  });
});
