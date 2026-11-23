import { createHash } from 'node:crypto';

export function hashToken(token: string) {
  const hash = createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}
