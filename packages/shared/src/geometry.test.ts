import { describe, it, expect } from "vitest";
import { cross } from "./geometry.js";

describe("cross", () => {
  it.each([
    [{ lng: 0, lat: 0 }, { lng: 1, lat: 0 }, { lng: 0, lat: 1 }, 1, "left"],
    [{ lng: 0, lat: 0 }, { lng: 1, lat: 0 }, { lng: 0, lat: -1 }, -1, "right"],
    [
      { lng: 0, lat: 0 },
      { lng: 1, lat: 0 },
      { lng: 2, lat: 0 },
      0,
      "on the line",
    ],
    [{ lng: 0, lat: 0 }, { lng: 1, lat: 1 }, { lng: 1, lat: 0 }, -1, "right"],
  ] as const)("b $4 of oa -> cross = $3", (o, a, b, result, _label) => {
    expect(cross(o, a, b)).toBe(result);
  });
});
