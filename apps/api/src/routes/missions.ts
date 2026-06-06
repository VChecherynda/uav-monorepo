import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { FastifyInstance } from "fastify";
import {
  assignMission,
  startMissionService,
} from "../services/missionService.js";

const AssignSchema = z.object({
  droneId: z.string(),
});

export function missionRoutes(app: FastifyInstance) {
  app.get("/missions", async () => {
    const missions = await prisma.mission.findMany({
      orderBy: { createdAt: "desc" },
      include: { waypoints: true },
    });

    return missions;
  });

  app.post("/missions/:id/assign", async (req, reply) => {
    const { id } = req.params as { id: string };

    const parsed = AssignSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send(z.flattenError(parsed.error));
    }

    const { droneId } = parsed.data;
    const result = await assignMission(id, droneId);
    if (result.status === "rejected") {
      return reply.code(409).send(result);
    }

    return reply.send(result);
  });

  app.post("/missions/:id/start", async (req, reply) => {
    const { id } = req.params as { id: string };

    const result = await startMissionService(id);
    if (result.status === "rejected") {
      return reply.code(409).send(result);
    }

    return reply.send(result);
  });
}
