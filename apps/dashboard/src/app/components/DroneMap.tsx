"use client";

import { useRef, useEffect } from "react";
import { Drone } from "@/lib/api";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE_URL = "https://tiles.stadiamaps.com/styles/alidade_smooth.json";
const MAP_ZOOM = 11;
const INITIAL_MAP_POSITION: [number, number] = [30.5234, 50.4501];

export const DroneMap = ({ drones }: { drones: Drone[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_MAP_POSITION, // Київ
      zoom: MAP_ZOOM,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;

      markersRef.current.forEach((marker, id) => {
        marker.remove();
        markersRef.current.delete(id);
      });
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    // Check stale drones in the ref.
    // seen - [A,B,C] - poll 1
    // seeb - [A,B] - poll 2
    // We need clear only dron C.
    const seen = new Set<string>();

    drones.forEach((drone) => {
      seen.add(drone.id);

      const existing = markersRef.current.get(drone.id);
      if (existing) {
        existing.setLngLat([drone.lng, drone.lat]);
      } else {
        const marker = new maplibregl.Marker({ color: "#10b981" })
          .setLngLat([drone.lng, drone.lat])
          .addTo(map);

        markersRef.current.set(drone.id, marker);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [drones]);

  return <div ref={containerRef} className="w-full h-full" />;
};
