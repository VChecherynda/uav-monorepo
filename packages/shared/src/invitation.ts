import { z } from 'zod';

export const InvitationNotFoundReasonSchema = z.object({
  code: z.literal('INVITATION_NOT_FOUND'),
  message: z.string(),
});

export type InvitationNotFoundReason = z.infer<
  typeof InvitationNotFoundReasonSchema
>;

const buildReason = <C extends string>(code: C) => {
  return z.object({
    code: z.literal(code),
    message: z.string(),
  });
};

export const InvitationConflictReasonSchema = z.discriminatedUnion('code', [
  buildReason('INVITATION_IS_EXPIRED'),
  buildReason('INVITATION_ALREADY_USED'),
]);

export type InvitationConflictReason = z.infer<
  typeof InvitationConflictReasonSchema
>;

export type InvitationRejectReason =
  InvitationConflictReason | InvitationNotFoundReason;
