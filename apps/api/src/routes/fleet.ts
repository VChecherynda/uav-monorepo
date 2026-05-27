import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";
import { mapDrones } from "../lib/mappers.js";

export async function fleetRoutes(app: FastifyInstance) {
  app.post("/fleet/reset", { preHandler: authenticate }, async () => {
    const result = await prisma.$transaction(async (tx) => {
      await tx.telemetry.deleteMany();
      const drones = await tx.drone.findMany({ orderBy: { name: "asc" } });

      const updatedDrones = await Promise.all(
        drones.map((d) =>
          tx.drone.update({
            where: { id: d.id },
            data: {
              battery: 100,
              status: "idle",
              altitude: 0,
              lng: d.homeLng,
              lat: d.homeLat,
            },
          }),
        ),
      );

      return updatedDrones;
    });

    return mapDrones(result);
  });
}
