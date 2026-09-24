import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { reportServerError } from './reportServerError.js';

export async function triageError(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  return reportServerError(error, req, reply);
}
