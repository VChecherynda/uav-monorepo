import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";

const CommandSchema = z.object({
  action: z.enum(["return-home", "land", "takeoff"]),
});

export async function droneRoutes(app: FastifyInstance) {
  app.get("/drones", async () =>
    prisma.drone.findMany({
      orderBy: { name: "asc" },
    }),
  );

  app.get("/drones/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const drone = await prisma.drone.findUnique({ where: { id } });
    if (!drone) return reply.code(404).send({ error: "Not found" });
    return drone;
  });

  app.get("/drones/:id/telemetry", async (req, reply) => {
    const { id } = req.params as { id: string };
    const telemetry = await prisma.telemetry.findMany({
      where: { droneId: id },
      orderBy: { recordedAt: "desc" },
      take: 50,
    });
    return telemetry;
  });

  app.post(
    "/drones/:id/command",
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = CommandSchema.safeParse(req.body);

      if (!parsed.success) {
        return reply.code(400).send(z.flattenError(parsed.error));
      }

      const { id } = req.params as { id: string };
      const drone = await prisma.drone.findUnique({ where: { id } });

      if (!drone) {
        return reply.code(404).send({ error: "Drone not found" });
      }

      if (drone.battery < 20) {
        return reply
          .code(409)
          .send({ error: `Insufficient battery: ${drone.battery}%` });
      }

      const updated = await prisma.drone.update({
        where: { id },
        data: { status: "returning" },
      });

      return {
        ok: true,
        drone: updated,
      };
    },
  );
}
