import { describe, it, expect } from "vitest";
import { findRoute } from "./findRoute";
import type { AdjacencyList } from "./findRoute";

//    A
//   / \
//  B - C
//   \ /
//    D

const graph: AdjacencyList = {
  A: [
    { id: "B", weight: 1 },
    { id: "C", weight: 5 },
  ],
  B: [
    { id: "C", weight: 1 },
    { id: "D", weight: 7 },
  ],
  C: [{ id: "D", weight: 7 }],
};

describe("findRoute when a path exists", () => {
  it("returns shortest path between connected edges", () => {
    expect(findRoute(graph, { id: "A", distance: 0 }, "D")).toEqual([
      "A",
      "B",
      "D",
    ]);
  });

  it("returns direct path between adjacent nodes", () => {
    expect(findRoute(graph, { id: "A", distance: 0 }, "C")).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("returns single-node path when start equals target", () => {
    expect(findRoute(graph, { id: "A", distance: 0 }, "A")).toEqual(["A"]);
  });
});

describe("findRoute when no path exists", () => {
  it.each([
    [{ id: "A", distance: 0 }, "G"],
    [{ id: "G", distance: 0 }, "A"],
  ] as const)("returns undefined for %s -> %s", (start, target) => {
    expect(findRoute(graph, start, target)).toBeUndefined();
  });
});
