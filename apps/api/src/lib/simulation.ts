import type { Drone } from "@uav/shared";
import { prisma } from "./prisma.js";
import { broadcastEvent } from "../routes/ws.js";

const SIMULATION_TIMEOUT = 2 * 1000; // 2 sec
const SKIP_LOG_THROTTLE_MS = 5 * 60 * 1000; // 5 min
const BATTERY_CRITICAL_THRESHOLD = 15; // battery 15%

const tick = async (broadcastDrones: (drones: Drone[]) => void) => {
  const drones = await prisma.drone.findMany({ orderBy: { name: "asc" } });
  const updatedDrones = await Promise.all(
    drones.map(async (d) => {
      const newLng = d.lng + (Math.random() - 0.5) * 0.003;
      const newLat = d.lat + (Math.random() - 0.5) * 0.003;
      const newBattery = Math.max(0, d.battery - (Math.random() < 0.5 ? 1 : 0));

      const updated = await prisma.drone.update({
        where: { id: d.id },
        data: {
          lng: newLng,
          lat: newLat,
          battery: newBattery,
        },
      });

      const crossedCriticalThreshold =
        d.battery >= BATTERY_CRITICAL_THRESHOLD &&
        newBattery < BATTERY_CRITICAL_THRESHOLD;

      if (crossedCriticalThreshold) {
        broadcastEvent({
          type: "BatteryCritical",
          droneId: d.id,
          battery: newBattery,
          at: new Date().toISOString(),
        });
      }

      await prisma.telemetry.create({
        data: {
          droneId: d.id,
          battery: newBattery,
          altitude: d.altitude,
          lng: newLng,
          lat: newLat,
        },
      });

      return updated;
    }),
  );

  broadcastDrones(updatedDrones as Drone[]);
};

export const startSimulation = (
  broadcastDrones: (drones: Drone[]) => void,
  hasClients: () => boolean,
) => {
  let skipCount = 0;
  let lastSkipLog = Date.now();

  return setInterval(() => {
    if (!hasClients()) {
      skipCount++;
      const now = Date.now();
      if (now - lastSkipLog >= SKIP_LOG_THROTTLE_MS) {
        console.log(
          `[simulation] Skipped ${skipCount} ticks in last ${Math.round(
            (now - lastSkipLog) / 1000,
          )}s (no WS clients)`,
        );
        skipCount = 0;
        lastSkipLog = now;
      }
      return;
    }

    tick(broadcastDrones).catch((err) =>
      console.error("[simulation] Tick failed:", err),
    );
  }, SIMULATION_TIMEOUT);
};
