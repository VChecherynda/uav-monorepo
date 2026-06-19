import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";
import {
  assignMission,
  completeMissionService,
  abortMissionService,
  startMissionService,
} from "../services/missionService.js";
import type { MissionRejectionReason } from "@uav/shared";

const AssignSchema = z.object({
  droneId: z.string(),
});

function statusFor(reason: MissionRejectionReason): number {
  if (
    reason.code === "MISSION_NOT_FOUND" ||
    reason.code === "DRONE_NOT_FOUND"
  ) {
    return 404;
  }

  return 409;
}

export function missionRoutes(app: FastifyInstance) {
  app.get("/missions", async () => {
    const missions = await prisma.mission.findMany({
      orderBy: { createdAt: "desc" },
      include: { waypoints: true },
    });

    return missions;
  });

  app.post(
    "/missions/:id/assign",
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const parsed = AssignSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send(z.flattenError(parsed.error));
      }

      const { droneId } = parsed.data;
      const result = await assignMission(id, droneId);
      if (result.status === "rejected") {
        return reply.code(statusFor(result.reason)).send(result.reason);
      }

      return reply.send(result);
    },
  );

  app.post(
    "/missions/:id/start",
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const result = await startMissionService(id);
      if (result.status === "rejected") {
        return reply.code(statusFor(result.reason)).send(result.reason);
      }

      return reply.send(result);
    },
  );

  app.post(
    "/missions/:id/abort",
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const result = await abortMissionService(id);
      if (result.status === "rejected") {
        return reply.code(statusFor(result.reason)).send(result.reason);
      }

      return reply.send(result);
    },
  );

  app.post(
    "/missions/:id/complete",
    { preHandler: authenticate },
    async (req, reply) => {
      const { id } = req.params as { id: string };

      const result = await completeMissionService(id);
      if (result.status === "rejected") {
        return reply.code(statusFor(result.reason)).send(result.reason);
      }

      return reply.send(result);
    },
  );
}
