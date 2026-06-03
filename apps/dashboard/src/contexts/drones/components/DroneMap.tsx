"use client";

import { useRef, useEffect } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDrones } from "../hooks/useDrones";

const MAP_STYLE_URL = `https://api.maptiler.com/maps/darkmatter/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;
const MAP_ZOOM = 11;
const INITIAL_MAP_POSITION: [number, number] = [133.88, -23.7];

const DRONE_STATUS_COLOR: Record<string, string> = {
  active: "#2ea043",
  idle: "#7d8590",
  offline: "#e5534b",
  returning: "#d29922",
};

function createDroneMarkerElement(status: string): HTMLDivElement {
  const color = DRONE_STATUS_COLOR[status] ?? "#7d8590";
  const wrapper = document.createElement("div");
  wrapper.style.width = "24px";
  wrapper.style.height = "24px";
  wrapper.style.cursor = "pointer";

  wrapper.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <!-- Propeller arms -->
      <line x1="4" y1="4" x2="20" y2="20" stroke="${color}" stroke-width="1.5"/>
      <line x1="20" y1="4" x2="4" y2="20" stroke="${color}" stroke-width="1.5"/>

      <!-- Propellers -->
      <circle cx="4"  cy="4"  r="3" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1"/>
      <circle cx="20" cy="4"  r="3" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1"/>
      <circle cx="4"  cy="20" r="3" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1"/>
      <circle cx="20" cy="20" r="3" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1"/>

      <!-- Center body -->
      <circle cx="12" cy="12" r="3" fill="${color}"/>
    </svg>
  `;

  return wrapper;
}

export const DroneMap = () => {
  const drones = useDrones();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<
    Map<
      string,
      {
        marker: maplibregl.Marker;
        element: HTMLDivElement;
        status: string;
      }
    >
  >(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_MAP_POSITION,
      zoom: MAP_ZOOM,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;

      markersRef.current.forEach((value, id) => {
        value.marker.remove();
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
        existing.marker.setLngLat([drone.lng, drone.lat]);

        if (existing.status !== drone.status) {
          const color = DRONE_STATUS_COLOR[drone.status] ?? "#7d8590";
          const lines = existing.element.querySelectorAll("line");
          const circles = existing.element.querySelectorAll("circle");

          lines.forEach((l) => l.setAttribute("stroke", color));
          circles.forEach((c) => {
            c.setAttribute("stroke", color);
            c.setAttribute("fill", color);
          });

          // Повертаємо opacity propeller колам
          const propellers = existing.element.querySelectorAll(
            "circle:not(:last-child)",
          );
          propellers.forEach((c) => c.setAttribute("fill-opacity", "0.3"));

          markersRef.current.set(drone.id, {
            ...existing,
            status: drone.status,
          });
        }
      } else {
        const element = createDroneMarkerElement(drone.status);
        const marker = new maplibregl.Marker({ element })
          .setLngLat([drone.lng, drone.lat])
          .addTo(map);

        markersRef.current.set(drone.id, {
          marker,
          element,
          status: drone.status,
        });
      }
    });

    markersRef.current.forEach((value, id) => {
      if (!seen.has(id)) {
        value.marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [drones]);

  return <div ref={containerRef} className="w-full h-full" />;
};
