import { describe, it, expect } from "vitest";
import { cross, segmentIntersectsPolygon } from "./segmentsIntersect";
import { Coordinate } from "@uav/shared";

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

describe("segmentIntersectsPolygon", () => {
  const L_SHAPE: Coordinate[] = [
    { lng: 0, lat: 0 },
    { lng: 10, lat: 0 },
    { lng: 10, lat: 5 },
    { lng: 5, lat: 5 },
    { lng: 5, lat: 10 },
    { lng: 0, lat: 10 },
  ];

  it.each([
    [{ lng: 10, lat: 10 }, { lng: 5, lat: 5 }, false, "doesn`t cross"],
    [{ lng: 8, lat: 8 }, { lng: 2, lat: 2 }, true, "cross"],
    [{ lng: 8, lat: 8 }, { lng: -15, lat: -15 }, true, "cross"],
  ] as const)("segment SG $3 area", (s, g, result, _label) => {
    expect(segmentIntersectsPolygon(s, g, L_SHAPE)).toBe(result);
  });
});
