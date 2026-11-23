import { describe, expect, it } from 'vitest';
import { hashToken } from './hashToken.js';

describe('hashToken', () => {
  it('returns the same hash for the same token', () => {
    const resultA = hashToken('tokenA');
    const resultB = hashToken('tokenA');

    expect(resultA).toBe(resultB);
  });

  it('returns a different hash if the token is different', () => {
    const resultA = hashToken('tokenA');
    const resultB = hashToken('tokenB');

    expect(resultA).not.toBe(resultB);
  });
});
