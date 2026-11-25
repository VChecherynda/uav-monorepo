import type {
  RefreshTokenRejectReason,
  RefreshTokensServiceResult,
} from '@uav/shared';
import type { Prisma } from '@prisma/client';

import jwt from 'jsonwebtoken';

import { hashToken } from '../lib/hashToken.js';
import { prisma } from '../lib/prisma.js';
import { canUseRefreshToken } from '../domain/refreshToken.js';
import { generateRefreshToken } from '../lib/generateRefreshToken.js';
import { config } from '../lib/config.js';

class RefreshTokenRejectedError extends Error {
  constructor(public reason: Pick<RefreshTokenRejectReason, 'code'>) {
    super(reason.code);
  }
}

async function lockRefreshTokenRow(
  tx: Prisma.TransactionClient,
  tokenHash: string,
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM "RefreshToken" WHERE "tokenHash"=${tokenHash} FOR UPDATE`;
}

const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function refreshTokensService(
  refreshToken: string,
  now: Date,
): Promise<RefreshTokensServiceResult> {
  const refreshTokenHash = hashToken(refreshToken);

  try {
    const result = await prisma.$transaction(async (tx) => {
      await lockRefreshTokenRow(tx, refreshTokenHash);

      const refreshTokenRow = await tx.refreshToken.findUnique({
        where: {
          tokenHash: refreshTokenHash,
        },
      });

      if (!refreshTokenRow) {
        throw new RefreshTokenRejectedError({
          code: 'REFRESH_TOKEN_NOT_FOUND',
        });
      }

      const next = canUseRefreshToken(refreshTokenRow, now);
      if (next.status === 'rejected') {
        throw new RefreshTokenRejectedError({
          code: next.reason.code,
        });
      }

      const newRefreshToken = generateRefreshToken();
      const newRefreshTokenHash = hashToken(newRefreshToken);
      const newAccessToken = jwt.sign(
        { userId: refreshTokenRow.userId },
        config.jwtSecret,
        {
          expiresIn: '5min',
        },
      );

      await tx.refreshToken.update({
        where: {
          tokenHash: refreshTokenHash,
        },
        data: {
          usedAt: now,
        },
      });

      await tx.refreshToken.create({
        data: {
          tokenHash: newRefreshTokenHash,
          usedAt: null,
          userId: refreshTokenRow.userId,
          expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    });

    return {
      status: 'success',
      ...result,
    };
  } catch (e) {
    if (e instanceof RefreshTokenRejectedError) {
      return { status: 'rejected', code: e.reason.code };
    }

    throw e;
  }
}
