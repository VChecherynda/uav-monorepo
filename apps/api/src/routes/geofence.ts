import { prisma } from "../lib/prisma.js";
import { GeofenceSchema } from "@uav/shared";
import type { FastifyInstance } from "fastify";

export async function geofenceRoutes(app: FastifyInstance) {
  app.get("/geofences", async (req, reply) => {
    const geofences = await prisma.geofence.findMany({
      orderBy: { createdAt: "desc" },
    });

    return GeofenceSchema.array().parse(geofences);
  });
}
