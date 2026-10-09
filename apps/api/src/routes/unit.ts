import { z } from 'zod';
import { authenticate, authorizeCommander } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { UnitRole } from '@prisma/client';
import { config } from '../lib/config.js';

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { generateInvitationCode } from '../lib/generateInvitationCode.js';

const InvitationSchema = z.object({
  unitRole: z.enum(UnitRole),
});

export async function unitRoutes(app: FastifyInstance) {
  app.post(
    '/unit/invitations',
    { preHandler: [authenticate, authorizeCommander] },
    async (req, reply) => {
      const result = InvitationSchema.safeParse(req.body);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: z.flattenError(result.error),
        });
      }

      const code = generateInvitationCode();
      const expiresAt = new Date(
        Date.now() + config.invitationTtlHours * 60 * 60 * 1000,
      );
      const { userId, unitId } = req as FastifyRequest & {
        userId: string;
        unitId: string;
      };

      const { unitRole } = result.data;

      await prisma.invitation.create({
        data: {
          code,
          unitId,
          unitRole,
          expiresAt,
          createdBy: userId,
        },
      });

      return reply.status(201).send({
        code,
        unitRole,
        expiresAt,
      });
    },
  );
}
