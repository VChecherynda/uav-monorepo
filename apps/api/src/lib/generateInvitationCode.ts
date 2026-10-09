import { randomInt } from 'node:crypto';

export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 8;

export function generateInvitationCode() {
  let code = '';

  for (let i = 0; i < CODE_LENGTH; i++) {
    const int = randomInt(ALPHABET.length);
    code += ALPHABET[int];
  }

  return code;
}
