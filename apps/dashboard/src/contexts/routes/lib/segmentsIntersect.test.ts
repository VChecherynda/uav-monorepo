import { describe, it, expect } from "vitest";
import type { Coordinate } from "@uav/shared";
import { segmentIntersectsPolygon } from "./segmentsIntersect";

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
