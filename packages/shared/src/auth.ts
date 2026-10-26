import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const UnitRoleSchema = z.enum(['COMMANDER', 'OPERATOR']);

export const MeSchema = z.object({
  unitId: z.string(),
  unitRole: UnitRoleSchema,
});

export type Me = z.infer<typeof MeSchema>;
