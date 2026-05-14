import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

const drones = [
  {
    name: "Falcon-1",
    status: "active",
    battery: 87,
    altitude: 120,
    lat: 50.4501,
    lng: 30.5234,
  },
  {
    name: "Hawk-2",
    status: "idle",
    battery: 64,
    altitude: 80,
    lat: 50.4259,
    lng: 30.5631,
  },
  {
    name: "Owl-3",
    status: "offline",
    battery: 12,
    altitude: 0,
    lat: 50.505,
    lng: 30.505,
  },
];

async function main() {
  await prisma.telemetry.deleteMany();
  await prisma.drone.deleteMany();
  await prisma.drone.createMany({ data: drones });

  const createdDrones = await prisma.drone.findMany({ orderBy: { name: "asc" } });

  for (const drone of createdDrones) {
    const now = Date.now();
    const telemetryHistory = Array.from({ length: 40 }, (_, i) => {
      const decay = Math.floor(i * (drone.battery * 0.15) / 40);
      return {
        droneId: drone.id,
        battery: Math.max(0, drone.battery - decay + Math.floor(Math.random() * 3 - 1)),
        altitude: drone.altitude,
        lat: drone.lat + (Math.random() - 0.5) * 0.01,
        lng: drone.lng + (Math.random() - 0.5) * 0.01,
        recordedAt: new Date(now - (40 - i) * 2000),
      };
    });
    await prisma.telemetry.createMany({ data: telemetryHistory });
  }

  console.log(`Seeded ${drones.length} drones with telemetry history`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
