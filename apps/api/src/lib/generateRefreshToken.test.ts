import { describe, it, expect } from 'vitest';
import { generateRefreshToken } from './generateRefreshToken.js';

describe('generateRefreshToken', () => {
  it('returns a 64-char token', () => {
    expect(generateRefreshToken().length).toBe(64);
  });

  it('returns a different token on each call', () => {
    const tokenA = generateRefreshToken();
    const tokenB = generateRefreshToken();

    expect(tokenA).not.toBe(tokenB);
  });
});
