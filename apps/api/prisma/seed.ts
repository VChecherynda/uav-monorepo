import { FlightMode, FlightPhase, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const drones = [
  {
    name: 'Falcon-1',
    missionId: 'm2',
    flightMode: 'AUTO' as FlightMode,
    flightPhase: 'IN_AIR' as FlightPhase,
    battery: 87,
    altitude: 120,
    homeLat: -23.7,
    homeLng: 133.88,
    lat: -23.7,
    lng: 133.88,
  },
  {
    name: 'Hawk-2',
    missionId: 'm2',
    flightMode: 'AUTO' as FlightMode,
    flightPhase: 'IN_AIR' as FlightPhase,
    battery: 64,
    altitude: 80,
    homeLat: -23.685,
    homeLng: 133.915,
    lat: -23.685,
    lng: 133.915,
  },
  {
    name: 'Owl-3',
    missionId: null,
    flightMode: 'AUTO' as FlightMode,
    flightPhase: 'IN_AIR' as FlightPhase,
    battery: 21,
    altitude: 0,
    homeLat: -23.73,
    homeLng: 133.855,
    lat: -23.73,
    lng: 133.855,
  },
];

const zones = [
  {
    name: 'Alice Springs Airport',
    area: [
      { lng: 133.892, lat: -23.812 },
      { lng: 133.912, lat: -23.812 },
      { lng: 133.912, lat: -23.792 },
      { lng: 133.892, lat: -23.792 },
    ],
  },
  {
    name: 'Restricted North',
    area: [
      { lng: 133.86, lat: -23.66 },
      { lng: 133.89, lat: -23.66 },
      { lng: 133.89, lat: -23.64 },
      { lng: 133.86, lat: -23.64 },
    ],
  },
];

async function main() {
  await prisma.telemetry.deleteMany();
  await prisma.waypoint.deleteMany();
  await prisma.drone.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.geofence.deleteMany();

  await prisma.mission.createMany({
    data: [
      { status: 'draft', name: 'Recon sector 1' },
      {
        id: 'm1',
        status: 'draft',
        name: 'Destroy infantry sector 2',
      },
      {
        id: 'm2',
        status: 'in-progress',
        name: 'Destroy infantry sector 3',
      },
      {
        id: 'm3',
        status: 'completed',
        name: 'Recon sector 2',
      },
      {
        id: 'm4',
        status: 'aborted',
        name: 'Destroy warehouse sector 2',
      },
    ],
  });

  await prisma.drone.createMany({ data: drones });
  await prisma.geofence.createMany({ data: zones });

  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: 'demo@uav.test',
      passwordHash: await bcrypt.hash('password123', 10),
    },
  });

  const createdDrones = await prisma.drone.findMany({
    orderBy: { name: 'asc' },
  });

  const falcon = createdDrones.find((d) => d.name === 'Falcon-1');
  if (!falcon) throw new Error('Seed: Falcon-1 not found');

  const hawk = createdDrones.find((d) => d.name === 'Hawk-2');
  if (!hawk) throw new Error('Seed: Hawk-2 not found');

  const owl = createdDrones.find((d) => d.name === 'Owl-3');
  if (!owl) throw new Error('Seed: Owl-3 not found');

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
