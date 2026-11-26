import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  assert,
  expect,
  it,
} from 'vitest';
import { refreshTokensService } from './refreshTokensService.js';
import { hashToken } from '../lib/hashToken.js';
import { prisma } from '../lib/prisma.js';
import type { User } from '@prisma/client';

let user: User;

const presentMS = Date.now();
const present = new Date(presentMS);
const dayMS = 24 * 60 * 60 * 1000;
const past = new Date(presentMS - dayMS);
const future = new Date(presentMS + dayMS);

beforeEach(async () => {
  user = await prisma.user.findUniqueOrThrow({
    where: { email: 'demo@uav.test' },
  });

  const tokenHash = hashToken('refreshToken');

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: future,
      usedAt: null,
    },
  });
});

describe('refreshTokensService', () => {
  it('rotates refresh token and returns pair', async () => {
    const result = await refreshTokensService('refreshToken', present);

    expect(result).toEqual({
      status: 'success',
      refreshToken: expect.any(String),
      accessToken: expect.any(String),
    });

    const oldTokenHash = hashToken('refreshToken');
    const oldRefreshToken = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: oldTokenHash },
    });

    expect(oldRefreshToken.usedAt).toEqual(present);

    assert(result.status === 'success');

    const newTokenHash = hashToken(result.refreshToken);
    const newRefreshToken = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: newTokenHash },
    });

    expect(newRefreshToken.usedAt).toEqual(null);
    expect(newRefreshToken.expiresAt).toEqual(future);
  });

  it('rejects unknown refresh token', async () => {
    const result = await refreshTokensService('unknownRefreshToken', present);

    assert(result.status === 'rejected');

    expect(result.code).toEqual('REFRESH_TOKEN_NOT_FOUND');
  });

  it('rejects expired refresh token', async () => {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken('expiredRefreshToken'),
        expiresAt: past,
        usedAt: null,
      },
    });

    const result = await refreshTokensService('expiredRefreshToken', present);

    assert(result.status === 'rejected');

    expect(result.code).toEqual('REFRESH_TOKEN_IS_EXPIRED');
  });

  it('rejects used refresh token', async () => {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken('usedRefreshToken'),
        expiresAt: future,
        usedAt: present,
      },
    });

    const result = await refreshTokensService('usedRefreshToken', present);

    assert(result.status === 'rejected');

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: user.id },
    });

    expect(result.code).toEqual('REFRESH_TOKEN_ALREADY_USED');
    expect(tokens.length).toBe(0);
  });
});

afterEach(async () => {
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
});

afterAll(() => prisma.$disconnect());
