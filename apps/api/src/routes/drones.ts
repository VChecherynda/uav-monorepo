import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  authenticate,
  authenticateUnitMember,
  requireActor,
} from '../lib/auth.js';
import type { FastifyInstance } from 'fastify';
import { mapDrone } from '../lib/mappers.js';
import { sendCommandService } from '../services/sendCommandService.js';

const CommandSchema = z.object({
  action: z.enum(['return-home', 'land', 'takeoff']),
});

export async function droneRoutes(app: FastifyInstance) {
  app.get(
    '/drones/:id/telemetry',
    { preHandler: [authenticate, authenticateUnitMember] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const droneRow = await prisma.drone.findUnique({ where: { id } });
      const actor = requireActor(req);

      if (!droneRow || droneRow.unitId !== actor.unitId) {
        return reply.code(404).send({
          status: 'rejected',
          reason: { code: 'DRONE_NOT_FOUND', message: 'Drone not found' },
        });
      }

      const telemetry = await prisma.telemetry.findMany({
        where: { droneId: id },
        orderBy: { recordedAt: 'desc' },
        take: 50,
      });
      return telemetry;
    },
  );

  app.post(
    '/drones/:id/command',
    { preHandler: authenticate },
    async (req, reply) => {
      const parsed = CommandSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send(z.flattenError(parsed.error));
      }

      const { action } = parsed.data;
      const { id } = req.params as { id: string };
      const droneRow = await prisma.drone.findUnique({ where: { id } });
      if (!droneRow)
        return reply.send({
          status: 'rejected',
          reason: { code: 'DRONE_NOT_FOUND', message: 'Drone not found' },
        });

      const result = await sendCommandService(mapDrone(droneRow), action);
      return reply.send(result);
    },
  );
}
