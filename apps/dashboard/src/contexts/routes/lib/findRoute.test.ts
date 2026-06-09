import { describe, it, expect } from "vitest";
import { findRoute } from "./findRoute";
import type { AdjacencyList } from "./findRoute";

//    A
//   / \
//  B   C
//   \ / \
//    D   E
//     \ /
//      F

const graph: AdjacencyList = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D", "E"],
  D: ["B", "C", "F"],
  E: ["C", "F"],
  F: ["D", "E"],
};

describe("findRoute when a path exists", () => {
  it("returns shortest path between connected nodes", () => {
    expect(findRoute(graph, "A", "F")).toEqual(["A", "B", "D", "F"]);
  });

  it("returns direct path between adjacent nodes", () => {
    expect(findRoute(graph, "A", "C")).toEqual(["A", "C"]);
  });

  it("returns single-node path when start equals target", () => {
    expect(findRoute(graph, "A", "A")).toEqual(["A"]);
  });
});

describe("findRoute when no path exists", () => {
  it.each([
    ["A", "G"],
    ["G", "A"],
  ] as const)("returns undefined for %s -> %s", (start, target) => {
    expect(findRoute(graph, start, target)).toBeUndefined();
  });
});
