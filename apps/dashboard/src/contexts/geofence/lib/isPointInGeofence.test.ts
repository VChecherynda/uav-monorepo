import { describe, it, expect } from "vitest";
import { isPointInGeofence } from "./isPointInGeofence";

import { Coordinate } from "@uav/shared";

// lat
// 10 │  D────────────C
//    │  │            │
//    │  │            │
//  0 │  A────────────B
//    │  └────────────────── lng
//       0            10
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

describe("isPointInGeofence - points inside", () => {
  it.each([
    [{ lng: 8, lat: 8 }, "center"],
    [{ lng: 5, lat: 5 }, "center"],
    [{ lng: 2, lat: 2 }, "center"],
  ] as const)("$2 -> inside", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(true);
  });
});

describe("isPointInGeofence - points outside", () => {
  it.each([
    [{ lng: 20, lat: 5 }, "right of square"],
    [{ lng: -5, lat: 5 }, "left of square"],
    [{ lng: 5, lat: 20 }, "above square"],
    [{ lng: 5, lat: -5 }, "below square"],
  ] as const)("$2 -> outside", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(false);
  });
});
