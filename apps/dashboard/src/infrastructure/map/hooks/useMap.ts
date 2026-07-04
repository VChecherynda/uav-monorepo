"use client";

import { useContext } from "react";
import { MapContext } from "../lib/MapContext";

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error("useMap must be used inside <MapCanvas>");
  }
  return map;
};
