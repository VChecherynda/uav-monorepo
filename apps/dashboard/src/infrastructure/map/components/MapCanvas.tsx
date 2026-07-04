"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapContext } from "../lib/MapContext";

const MAP_STYLE_URL = `https://api.maptiler.com/maps/darkmatter/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;
const MAP_ZOOM = 11;
const INITIAL_MAP_POSITION: [number, number] = [133.88, -23.7];

export function MapCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const _map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_MAP_POSITION,
      zoom: MAP_ZOOM,
    });

    _map.on("load", () => {
      if (!cancelled) {
        setMap(_map);
      }
    });

    return () => {
      cancelled = true;
      _map.remove();
      setMap(null);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {map && <MapContext.Provider value={map}>{children}</MapContext.Provider>}
    </div>
  );
}
