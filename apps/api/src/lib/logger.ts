import pino from 'pino';
import { config } from './config.js';

export const logger = config.isProduction
  ? pino()
  : pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
