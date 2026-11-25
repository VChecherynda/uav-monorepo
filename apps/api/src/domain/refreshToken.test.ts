import { describe, it, expect } from 'vitest';
import { canUseRefreshToken } from './refreshToken.js';

describe('canUseRefreshToken', () => {
  const presentMS = Date.now();
  const present = new Date(presentMS);
  const past = new Date(presentMS - 10000);
  const future = new Date(presentMS + 10000);

  it('can use refresh token', () => {
    expect(
      canUseRefreshToken({ expiresAt: future, usedAt: null }, present),
    ).toEqual({
      status: 'success',
    });
  });

  it.each([
    [
      { expiresAt: future, usedAt: present },
      {
        code: 'REFRESH_TOKEN_ALREADY_USED',
        message: 'Refresh token has already been used',
      },
    ],
    [
      { expiresAt: past, usedAt: null },
      {
        code: 'REFRESH_TOKEN_IS_EXPIRED',
        message: 'Refresh token is expired',
      },
    ],
    [
      { expiresAt: past, usedAt: present },
      {
        code: 'REFRESH_TOKEN_ALREADY_USED',
        message: 'Refresh token has already been used',
      },
    ],
  ])('rejects with reason: %s', (refreshToken, reason) => {
    expect(canUseRefreshToken(refreshToken, present)).toEqual({
      status: 'rejected',
      reason,
    });
  });
});
