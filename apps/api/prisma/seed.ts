import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const drones = [
  {
    name: "Falcon-1",
    status: "active",
    battery: 87,
    altitude: 120,
    homeLat: -23.7,
    homeLng: 133.88,
    lat: -23.7,
    lng: 133.88,
  },
  {
    name: "Hawk-2",
    status: "idle",
    battery: 64,
    altitude: 80,
    homeLat: -23.685,
    homeLng: 133.915,
    lat: -23.685,
    lng: 133.915,
  },
  {
    name: "Owl-3",
    status: "idle",
    battery: 21,
    altitude: 0,
    homeLat: -23.73,
    homeLng: 133.855,
    lat: -23.73,
    lng: 133.855,
  },
];

async function main() {
  await prisma.telemetry.deleteMany();
  await prisma.waypoint.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.drone.deleteMany();
  await prisma.drone.createMany({ data: drones });
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: "demo@uav.test",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  const createdDrones = await prisma.drone.findMany({
    orderBy: { name: "asc" },
  });

  const falcon = createdDrones.find((d) => d.name === "Falcon-1");
  if (!falcon) throw new Error("Seed: Falcon-1 not found");

  const hawk = createdDrones.find((d) => d.name === "Hawk-2");
  if (!hawk) throw new Error("Seed: Hawk-2 not found");

  const owl = createdDrones.find((d) => d.name === "Owl-3");
  if (!owl) throw new Error("Seed: Owl-3 not found");

  await prisma.mission.createMany({
    data: [
      { status: "draft", droneId: null },
      { status: "assigned", droneId: hawk.id },
      { status: "in-progress", droneId: falcon.id },
      { status: "completed", droneId: owl.id },
      { status: "aborted", droneId: owl.id },
    ],
  });

  for (const drone of createdDrones) {
    const now = Date.now();
    const telemetryHistory = Array.from({ length: 40 }, (_, i) => {
      const decay = Math.floor((i * (drone.battery * 0.15)) / 40);
      return {
        droneId: drone.id,
        battery: Math.max(
          0,
          drone.battery - decay + Math.floor(Math.random() * 3 - 1),
        ),
        altitude: drone.altitude,
        lat: drone.lat + (Math.random() - 0.5) * 0.01,
        lng: drone.lng + (Math.random() - 0.5) * 0.01,
        recordedAt: new Date(now - (40 - i) * 2000),
      };
    });
    await prisma.telemetry.createMany({ data: telemetryHistory });
  }

  console.log(
    `Seeded ${drones.length} drones with telemetry history and 5 missions`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
