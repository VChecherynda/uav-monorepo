import { startSimulation } from './lib/simulation.js';
import { startHousekeeping } from './lib/housekeeping.js';
import { hasClients, broadcastDrones, startHeartbeat } from './routes/ws.js';
import { prisma } from './lib/prisma.js';
import { config } from './lib/config.js';
import { buildApp } from './app.js';

const app = await buildApp();
const address = await app.listen({ port: config.port, host: config.host });
app.log.info(`API on ${address}`);

const simulationTimer = startSimulation(broadcastDrones, hasClients);
const housekeepingTimer = startHousekeeping();
const heartbeatTimer = startHeartbeat();

app.log.info(
  'Background processes started: simulation, housekeeping, heartbeat',
);

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, starting graceful shutdown...`);

  clearInterval(simulationTimer);
  clearInterval(housekeepingTimer);
  clearInterval(heartbeatTimer);
  app.log.info('Background timers stopped');

  await app.close();
  app.log.info('HTTP server closed');

  await prisma.$disconnect();
  app.log.info('Database disconnected');

  process.exit(0);
};

process.on('SIGTERM', () => {
  process.stdout.write('>>> SIGTERM RECEIVED <<<\n');
  shutdown('SIGTERM');
});
process.on('SIGINT', () => shutdown('SIGINT'));
