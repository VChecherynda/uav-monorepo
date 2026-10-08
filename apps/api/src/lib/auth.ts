import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { prisma } from './prisma.js';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      error: 'Missing or invalid token',
    });
  }

  const secret = config.jwtSecret;
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    (req as FastifyRequest & { userId: string }).userId = payload.userId;
  } catch (e) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function authorizeCommander(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = req as FastifyRequest & { userId: string };

  const unitMember = await prisma.unitMember.findUnique({
    where: { userId },
  });

  if (unitMember === null) {
    return reply.status(401).send({ error: 'Unit member not found' });
  }

  const { unitId, unitRole } = unitMember;

  if (unitRole !== 'COMMANDER') {
    return reply.status(403).send({ error: 'Commander role required' });
  }

  (req as FastifyRequest & { unitId: string }).unitId = unitId;
}
