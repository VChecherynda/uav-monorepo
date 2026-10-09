import { describe, it, expect } from 'vitest';
import {
  generateInvitationCode,
  ALPHABET,
  CODE_LENGTH,
} from './generateInvitationCode.js';

describe('generateInvitationCode', () => {
  it('returns 8 chars from alphabet', () => {
    const code = generateInvitationCode();

    expect(code.length).toBe(CODE_LENGTH);
    expect([...code].every((char) => ALPHABET.includes(char))).toBe(true);
  });

  it('returns different code on each call', () => {
    const codeA = generateInvitationCode();
    const codeB = generateInvitationCode();

    expect(codeA).not.toBe(codeB);
  });
});
