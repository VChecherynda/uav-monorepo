import { prisma } from "./prisma.js";

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

export const startSimulation = (broadcastDrones: () => Promise<void>) =>
  setInterval(() => tick(broadcastDrones), 2000);
