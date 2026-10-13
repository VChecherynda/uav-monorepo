import type { UnitRole } from '@prisma/client';

export type Actor = { userId: string; unitId: string; unitRole: UnitRole };
