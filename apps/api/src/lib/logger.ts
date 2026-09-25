import pino from 'pino';
import { config } from './config.js';
import { redactUrlToken } from './redactUrlToken.js';
import type { FastifyRequest } from 'fastify';

const serializeRequest = (req: FastifyRequest) => ({
  method: req.method,
  url: redactUrlToken(req.url),
  version: req.headers && req.headers['accept-version'],
  host: req.host,
  remoteAddress: req.ip,
  remotePort: req.socket ? req.socket.remotePort : undefined,
});

const options = { serializers: { req: serializeRequest } };

export const logger = config.isProduction
  ? pino(options)
  : pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
