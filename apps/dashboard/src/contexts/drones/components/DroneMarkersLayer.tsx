"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useDrones } from "../hooks/useDrones";
import { useMap } from "@/infrastructure/map";
import type { Drone } from "@uav/shared";

const DRONE_STATUS_COLOR: Record<string, string> = {
  active: "#2ea043",
  idle: "#7d8590",
  offline: "#e5534b",
  returning: "#d29922",
};

function getDroneCaption(drone: Drone): string {
  return drone.name;
}

function createDroneMarkerElements(status: string): {
  wrapper: HTMLDivElement;
  icon: SVGSVGElement;
  plate: HTMLDivElement;
} {
  const color = DRONE_STATUS_COLOR[status] ?? "#7d8590";

  const wrapper = document.createElement("div");
  wrapper.style.width = "24px";
  wrapper.style.height = "24px";
  wrapper.style.position = "relative";
  wrapper.style.cursor = "pointer";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "24px");
  icon.setAttribute("height", "24px");
  icon.setAttribute("viewBox", "0 0 24px 24px");
  icon.setAttribute("fill", "none");

  icon.innerHTML = `
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
    `;

  const plate = document.createElement("div");
  plate.style.position = "absolute";
  plate.style.top = "26px";
  plate.style.left = "50%";
  plate.style.transform = "translateX(-50%)";
  plate.style.whiteSpace = "nowrap";
  plate.style.pointerEvents = "none";
  plate.style.fontFamily = "var(--font-mono)";
  plate.style.fontSize = "10px";
  plate.style.letterSpacing = "0.04em";
  plate.style.color = color;
  plate.style.textShadow = "0 0 2px var(--bg-deep)";

  wrapper.appendChild(icon);
  wrapper.appendChild(plate);

  return { wrapper, icon, plate };
}

export function DroneMarkersLayer() {
  const map = useMap();
  const drones = useDrones();
  const markersRef = useRef<
    Map<
      string,
      {
        marker: maplibregl.Marker;
        icon: SVGSVGElement;
        plate: HTMLDivElement;
        status: string;
      }
    >
  >(new Map());

  useEffect(() => {
    // Check stale drones in the ref.
    // seen - [A,B,C] - poll 1
    // seeb - [A,B] - poll 2
    // We need clear only dron C.
    const seen = new Set<string>();

    drones.forEach((drone) => {
      seen.add(drone.id);

      let entry = markersRef.current.get(drone.id);

      if (!entry) {
        const { wrapper, icon, plate } = createDroneMarkerElements(
          drone.status,
        );
        entry = {
          marker: new maplibregl.Marker({ element: wrapper })
            .setLngLat([drone.lng, drone.lat])
            .addTo(map),
          icon,
          plate,
          status: drone.status,
        };

        markersRef.current.set(drone.id, entry);
      }

      entry.marker.setLngLat([drone.lng, drone.lat]);
      entry.plate.textContent = getDroneCaption(drone);

      if (entry.status !== drone.status) {
        const color = DRONE_STATUS_COLOR[drone.status] ?? "#7d8590";
        const lines = entry.icon.querySelectorAll("line");
        const circles = entry.icon.querySelectorAll("circle");

        lines.forEach((l) => l.setAttribute("stroke", color));
        circles.forEach((c) => {
          c.setAttribute("stroke", color);
          c.setAttribute("fill", color);
        });
        entry.plate.style.color = color;

        // Повертаємо opacity propeller колам
        const propellers = entry.icon.querySelectorAll(
          "circle:not(:last-child)",
        );
        propellers.forEach((c) => c.setAttribute("fill-opacity", "0.3"));

        entry.status = drone.status;
      }
    });

    markersRef.current.forEach((value, id) => {
      if (!seen.has(id)) {
        value.marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [drones, map]);

  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      markers.forEach((v) => v.marker.remove());
      markers.clear();
    };
  }, []);

  return null;
}
