import { describe, it, expect } from "vitest";
import {
  Coordinate,
  cross,
  isPointInPolygon,
  segmentIntersectsPolygon,
} from "./geometry.js";

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

const SQUARE: Coordinate[] = [
  {
    lng: 0,
    lat: 0,
  }, // A
  {
    lng: 10,
    lat: 0,
  }, // B
  {
    lng: 10,
    lat: 10,
  }, // C
  {
    lng: 0,
    lat: 10,
  }, // D
];

describe("isPointInPolygon - points inside", () => {
  it.each([
    [{ lng: 8, lat: 8 }, "center"],
    [{ lng: 5, lat: 5 }, "center"],
    [{ lng: 2, lat: 2 }, "center"],
  ] as const)("$1 -> inside", (point, _label) => {
    expect(isPointInPolygon(point, SQUARE)).toBe(true);
  });
});

describe("isPointInPolygon - points outside", () => {
  it.each([
    [{ lng: 20, lat: 5 }, "right of square"],
    [{ lng: -5, lat: 5 }, "left of square"],
    [{ lng: 5, lat: 20 }, "above square"],
    [{ lng: 5, lat: -5 }, "below square"],
  ] as const)("$1 -> outside", (point, _label) => {
    expect(isPointInPolygon(point, SQUARE)).toBe(false);
  });
});

describe("isPointInPolygon - points on the sides and vertex", () => {
  it.each([
    [{ lng: 0, lat: 0 }, "bottom left vertex"],
    [{ lng: 10, lat: 0 }, "bottom right vertex"],
    [{ lng: 10, lat: 10 }, "top right vertex"],
    [{ lng: 0, lat: 10 }, "top left vertex"],
    [{ lng: 5, lat: 0 }, "middle of bottom side"],
    [{ lng: 0, lat: 5 }, "middle of the left side"],
  ] as const)("$1", (point, _label) => {
    expect(isPointInPolygon(point, SQUARE)).toBe(false);
  });

  it.each([
    [{ lng: 5, lat: 5 }, "in the middle of the area"],
    [{ lng: 0.1, lat: 5 }, "close to the side"],
  ] as const)("$1", (point, _label) => {
    expect(isPointInPolygon(point, SQUARE)).toBe(true);
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
