import type { FastifyInstance } from 'fastify';
import { authenticate, authorizeCommander } from '../lib/auth.js';

export async function unitRoutes(app: FastifyInstance) {
  app.post(
    '/unit/invitations',
    { preHandler: [authenticate, authorizeCommander] },
    async () => {},
  );
}
