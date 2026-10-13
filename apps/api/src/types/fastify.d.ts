import type { UnitRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    unitId?: string;
    unitRole?: UnitRole;
  }
}
