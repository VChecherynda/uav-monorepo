import jwt from 'jsonwebtoken';
import { config } from './config.js';

export function buildAccessToken(userId: string) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '5Min' });
}
