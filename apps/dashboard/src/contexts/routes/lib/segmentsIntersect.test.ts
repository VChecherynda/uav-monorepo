import { describe, it, expect } from "vitest";
import {
  cross,
  segmentsIntersect,
  segmentIntersectsPolygon,
} from "./segmentsIntersect";
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

describe("segmentsIntersect", () => {
  it.each([
    [
      { lng: 2, lat: 2 },
      { lng: 4, lat: 5 },
      { lng: 3, lat: 0 },
      { lng: 3, lat: 4 },
      true,
      "cross",
    ],
    [
      { lng: 2, lat: 4 },
      { lng: 4, lat: 4 },
      { lng: 6, lat: 0 },
      { lng: 6, lat: 6 },
      false,
      "doesn`t cross",
    ],
    [
      { lng: 6, lat: 0 },
      { lng: 6, lat: 6 },
      { lng: 2, lat: 4 },
      { lng: 4, lat: 4 },
      false,
      "doesn`t cross",
    ],
    [
      { lng: 2, lat: 4 },
      { lng: 4, lat: 7 },
      { lng: 2, lat: 2 },
      { lng: 4, lat: 5 },
      false,
      "doesn`t cross",
    ],
  ] as const)(
    "segment b $5 segment a",
    (aStart, aEnd, bStart, bEnd, result, _label) => {
      expect(segmentsIntersect(aStart, aEnd, bStart, bEnd)).toBe(result);
    },
  );
});

describe("segmentIntersectsPolygon", () => {
  const area: Coordinate[] = [
    { lng: 0, lat: 0 },
    { lng: 10, lat: 0 },
    { lng: 10, lat: 10 },
    { lng: 0, lat: 10 },
  ];

  it.each([
    [{ lng: -5, lat: 15 }, { lng: 15, lat: 15 }, false, "doesn`t cross"],
    [{ lng: -5, lat: 5 }, { lng: 15, lat: 5 }, true, "cross"],
    [{ lng: 2, lat: 5 }, { lng: 6, lat: 5 }, true, "cross"],
  ] as const)("segment SG $3 area", (s, g, result, _label) => {
    expect(segmentIntersectsPolygon(s, g, area)).toBe(result);
  });
});
