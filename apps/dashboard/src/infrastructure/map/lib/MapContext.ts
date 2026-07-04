"use client";

import { createContext } from "react";
import maplibregl from "maplibre-gl";

export const MapContext = createContext<maplibregl.Map | null>(null);
