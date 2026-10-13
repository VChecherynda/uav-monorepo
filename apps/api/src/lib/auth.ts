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
    req.userId = payload.userId;
  } catch (e) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function authenticateUnitMember(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = req;

  if (!userId) {
    throw new Error('authenticate must run first');
  }

  const unitMember = await prisma.unitMember.findUnique({
    where: { userId },
  });

  if (unitMember === null) {
    return reply.status(401).send({ error: 'Unit member not found' });
  }

  req.unitId = unitMember.unitId;
  req.unitRole = unitMember.unitRole;
}

export async function authorizeCommander(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { unitRole } = req;

  if (!unitRole) {
    throw new Error('authenticateUnitMember must run first');
  }

  if (unitRole !== 'COMMANDER') {
    return reply.status(403).send({ error: 'Commander role required' });
  }
}
