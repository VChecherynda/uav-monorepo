import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { triageError } from './lib/triageError.js';
import { droneRoutes } from './routes/drones.js';
import { authRoutes } from './routes/auth.js';
import { fleetRoutes } from './routes/fleet.js';
import { missionRoutes } from './routes/missions.js';
import { geofenceRoutes } from './routes/geofence.js';
import { unitRoutes } from './routes/unit.js';
import { wsRoutes } from './routes/ws.js';
import { logger } from './lib/logger.js';
import { config } from './lib/config.js';

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: 2,
  });

  await app.register(cors, {
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.setErrorHandler(triageError);

  await app.register(websocket, {});
  await app.register(wsRoutes);
  await app.register(authRoutes);
  await app.register(droneRoutes);
  await app.register(fleetRoutes);
  await app.register(missionRoutes);
  await app.register(geofenceRoutes);
  await app.register(unitRoutes);

  app.get('/health', async (req) => ({ status: 'ok' }));

  return app;
}
