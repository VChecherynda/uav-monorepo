import type { RefreshToken } from '@prisma/client';
import type { RefreshTokenRejectReason } from '@uav/shared';

export const canUseRefreshToken = (
  refreshToken: Pick<RefreshToken, 'expiresAt' | 'usedAt'> | null,
  now: Date,
):
  | {
      status: 'success';
    }
  | {
      status: 'rejected';
      reason: RefreshTokenRejectReason;
    } => {
  if (refreshToken === null) {
    return {
      status: 'rejected',
      reason: {
        code: 'REFRESH_TOKEN_NOT_FOUND',
        message: 'Refresh token not found',
      },
    };
  }

  const { expiresAt, usedAt } = refreshToken;

  if (usedAt !== null) {
    return {
      status: 'rejected',
      reason: {
        code: 'REFRESH_TOKEN_ALREADY_USED',
        message: 'Refresh token has already been used',
      },
    };
  }

  if (expiresAt < now) {
    return {
      status: 'rejected',
      reason: {
        code: 'REFRESH_TOKEN_IS_EXPIRED',
        message: 'Refresh token is expired',
      },
    };
  }

  return {
    status: 'success',
  };
};
