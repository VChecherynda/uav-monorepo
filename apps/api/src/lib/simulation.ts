import { prisma } from "./prisma.js";

const SIMULATION_TIMEOUT = 2 * 1000; // 2 sec
const SKIP_LOG_THROTTLE_MS = 5 * 60 * 1000; // 5 min

const tick = async (broadcastDrones: () => Promise<void>) => {
  const drones = await prisma.drone.findMany();
  await Promise.all(
    drones.map(async (d) => {
      const newLng = d.lng + (Math.random() - 0.5) * 0.003;
      const newLat = d.lat + (Math.random() - 0.5) * 0.003;
      const newBattery = Math.max(
        0,
        d.battery - (Math.random() < 0.01 ? 1 : 0),
      );

      await prisma.drone.update({
        where: { id: d.id },
        data: {
          lng: newLng,
          lat: newLat,
          battery: newBattery,
        },
      });

      await prisma.telemetry.create({
        data: {
          droneId: d.id,
          battery: newBattery,
          altitude: d.altitude,
          lng: newLng,
          lat: newLat,
        },
      });
    }),
  );

  await broadcastDrones();
};

export const startSimulation = (
  broadcastDrones: () => Promise<void>,
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
