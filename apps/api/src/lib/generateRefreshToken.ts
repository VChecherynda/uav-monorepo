import { randomBytes } from 'node:crypto';

export function generateRefreshToken() {
  const buffer = randomBytes(32);
  return buffer.toString('hex');
}
