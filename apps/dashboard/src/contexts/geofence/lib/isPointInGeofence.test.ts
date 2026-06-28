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
  ] as const)("$1 -> inside", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(true);
  });
});

describe("isPointInGeofence - points outside", () => {
  it.each([
    [{ lng: 20, lat: 5 }, "right of square"],
    [{ lng: -5, lat: 5 }, "left of square"],
    [{ lng: 5, lat: 20 }, "above square"],
    [{ lng: 5, lat: -5 }, "below square"],
  ] as const)("$1 -> outside", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(false);
  });
});

describe("isPointInGeofence - points on the sides and vertex", () => {
  it.each([
    [{ lng: 0, lat: 0 }, "bottom left vertex"],
    [{ lng: 10, lat: 0 }, "bottom right vertex"],
    [{ lng: 10, lat: 10 }, "top right vertex"],
    [{ lng: 0, lat: 10 }, "top left vertex"],
    [{ lng: 5, lat: 0 }, "middle of bottom side"],
    [{ lng: 0, lat: 5 }, "middle of the left side"],
  ] as const)("$1", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(false);
  });

  it.each([
    [{ lng: 5, lat: 5 }, "in the middle of the area"],
    [{ lng: 0.1, lat: 5 }, "close to the side"],
  ] as const)("$1", (point, _label) => {
    expect(isPointInGeofence(point, SQUARE)).toBe(true);
  });
});
