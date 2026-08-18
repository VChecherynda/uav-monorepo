import type { Drone } from "@uav/shared";
import { prisma } from "./prisma.js";
import { broadcastEvent } from "../routes/ws.js";
import { mapDrones } from "./mappers.js";
import { logger } from "../lib/logger.js";
import type { Drone as PrismaDrone } from "@prisma/client";

const SIMULATION_TIMEOUT = 2 * 1000; // 2 sec
const SKIP_LOG_THROTTLE_MS = 5 * 60 * 1000; // 5 min
const ERROR_LOG_THROTTLE_MS = 5 * 60 * 1000; // 5 min
const BATTERY_CRITICAL_THRESHOLD = 15; // battery 15%
const BATTERY_RECOVERY_THRESHOLD = 5;
const INITIAL_BATTERY = 100;

const log = logger.child({ module: "simulation" });

const tick = async (broadcastDrones: (drones: Drone[]) => void) => {
  const drones = await prisma.drone.findMany({ orderBy: { name: "asc" } });
  const updatedDrones = await Promise.allSettled(
    drones.map(async (d) => {
      const shouldRecover = d.battery < BATTERY_RECOVERY_THRESHOLD;

      if (shouldRecover) {
        const updated = await prisma.$transaction(async (tx) => {
          const updatedDrone = await tx.drone.update({
            where: { id: d.id },
            data: {
              status: "idle",
              battery: INITIAL_BATTERY,
              altitude: 0,
              lng: d.homeLng,
              lat: d.homeLat,
            },
          });

          await tx.telemetry.create({
            data: {
              droneId: d.id,
              battery: INITIAL_BATTERY,
              altitude: 0,
              lng: d.homeLng,
              lat: d.homeLat,
            },
          });

          return updatedDrone;
        });

        broadcastEvent({
          type: "DroneRecovered",
          droneId: d.id,
          at: new Date().toISOString(),
        });

        return updated;
      } else {
        const newLng = d.lng + (Math.random() - 0.5) * 0.003;
        const newLat = d.lat + (Math.random() - 0.5) * 0.003;
        const newBattery = Math.max(
          0,
          d.battery - (Math.random() < 0.01 ? 1 : 0),
        );

        const updated = await prisma.$transaction(async (tx) => {
          const updatedDrone = await tx.drone.update({
            where: { id: d.id },
            data: {
              lng: newLng,
              lat: newLat,
              battery: newBattery,
            },
          });

          await tx.telemetry.create({
            data: {
              droneId: d.id,
              battery: newBattery,
              altitude: d.altitude,
              lng: newLng,
              lat: newLat,
            },
          });

          return updatedDrone;
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

        return updated;
      }
    }),
  );

  const dronesResolved = updatedDrones.reduce<{
    fulfilled: PrismaDrone[];
    rejected: unknown[];
  }>(
    (acc, resolved) => {
      if (resolved.status === "fulfilled") {
        acc.fulfilled.push(resolved.value);
      }

      if (resolved.status === "rejected") {
        acc.rejected.push(resolved.reason);
      }

      return acc;
    },
    {
      fulfilled: [],
      rejected: [],
    },
  );

  broadcastDrones(mapDrones(dronesResolved.fulfilled));

  dronesResolved.rejected.forEach((err) =>
    log.error({ err }, "Drone update failed"),
  );
};

export const startSimulation = (
  broadcastDrones: (drones: Drone[]) => void,
  hasClients: () => boolean,
) => {
  let skipCount = 0;
  let lastSkipLog = Date.now();
  let repeatedCount = 0;
  let lastErrorKey = "";
  let lastErrorLog = 0;

  return setInterval(() => {
    if (!hasClients()) {
      skipCount++;
      const now = Date.now();
      if (now - lastSkipLog >= SKIP_LOG_THROTTLE_MS) {
        log.info(
          { skipCount, seconds: Math.round((now - lastSkipLog) / 1000) },
          "Skipped ticks (no WS clients)",
        );

        skipCount = 0;
        lastSkipLog = now;
      }
      return;
    }

    tick(broadcastDrones).catch((err) => {
      const key =
        err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      const now = Date.now();

      if (key !== lastErrorKey || now - lastErrorLog >= ERROR_LOG_THROTTLE_MS) {
        log.error({ err, repeated: repeatedCount }, "Tick failed");

        repeatedCount = 0;
        lastErrorKey = key;
        lastErrorLog = now;
        return;
      }

      repeatedCount++;
    });
  }, SIMULATION_TIMEOUT);
};
