import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";
import type {
  CommandRejectionReason,
  CommandResult,
  DomainEvent,
  Drone,
} from "@uav/shared";
import { broadcastEvent } from "./ws.js";

const BATTERY_CRITICAL_THRESHOLD = 15;

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
      // === TRANSPORT LAYER ===
      const parsed = CommandSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send(z.flattenError(parsed.error));
      }

      const { action } = parsed.data;
      const { id } = req.params as { id: string };

      // === DOMAIN LAYER (always 200 + CommandResult) ===
      const drone = await prisma.drone.findUnique({ where: { id } });

      const reject = (reason: CommandRejectionReason): CommandResult => {
        const event: DomainEvent = {
          type: "DroneCommandRejected",
          droneId: id,
          action,
          reason,
          at: new Date().toISOString(),
        };
        broadcastEvent(event);
        return { status: "rejected", reason };
      };

      if (!drone) {
        return reject({
          code: "DRONE_NOT_FOUND",
          message: "Drone not found",
        });
      }

      if (drone.status === "offline") {
        return reject({
          code: "DRONE_OFFLINE",
          message: `Drone ${drone.name} is offline`,
        });
      }

      if (drone.battery < 20) {
        return reject({
          code: "INSUFFICIENT_BATTERY",
          message: `Insufficient battery: ${drone.battery}%`,
          currentBattery: drone.battery,
        });
      }

      const updated = await prisma.drone.update({
        where: { id },
        data: { status: "returning" },
      });

      return {
        status: "success",
        drone: updated as Drone,
      } satisfies CommandResult;
    },
  );
}
