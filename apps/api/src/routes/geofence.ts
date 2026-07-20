import { prisma } from "../lib/prisma.js";
import { GeofenceSchema } from "@uav/shared";
import type { FastifyInstance } from "fastify";

export async function geofenceRoutes(app: FastifyInstance) {
  app.get("/geofences", async (req, reply) => {
    const geofences = await prisma.geofence.findMany({
      orderBy: { createdAt: "desc" },
    });

    const result = GeofenceSchema.array().safeParse(geofences);
    if (!result.success) {
      req.log.error(
        { err: result.error },
        "Geofence row failed schema validation",
      );

      return reply.status(500).send({
        error: "Internal server error",
      });
    }

    return result.data;
  });
}
