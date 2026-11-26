import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import { buildAccessToken } from './buildAccessToken.js';
import { config } from './config.js';

describe('buildAccessToken', () => {
  it('returns a token with userId and lifetime', () => {
    const result = buildAccessToken('user1');
    const payload = jwt.verify(result, config.jwtSecret) as {
      userId: string;
      exp: number;
      iat: number;
    };

    const expiresIn = payload.exp - payload.iat;

    expect(payload.userId).toBe('user1');
    expect(expiresIn).toBe(300);
  });
});
