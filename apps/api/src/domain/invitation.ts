import type { Invitation } from '@prisma/client';
import type {
  InvitationConflictReason,
  InvitationNotFoundReason,
} from '@uav/shared';

export const canUseInvitation = (
  invitation: Pick<Invitation, 'expiresAt' | 'usedAt'> | null,
  now: Date,
):
  | {
      status: 'success';
    }
  | {
      status: 'rejected';
      reason: InvitationConflictReason | InvitationNotFoundReason;
    } => {
  if (invitation === null) {
    return {
      status: 'rejected',
      reason: {
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
      },
    };
  }

  const { expiresAt, usedAt } = invitation;

  if (expiresAt < now) {
    return {
      status: 'rejected',
      reason: {
        code: 'INVITATION_IS_EXPIRED',
        message: 'Invitation is expired',
      },
    };
  }

  if (usedAt !== null) {
    return {
      status: 'rejected',
      reason: {
        code: 'INVITATION_ALREADY_USED',
        message: 'Invitation has already been used',
      },
    };
  }

  return {
    status: 'success',
  };
};
