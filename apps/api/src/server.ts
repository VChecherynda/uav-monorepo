import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { startSimulation } from "./lib/simulation.js";
import { startHousekeeping } from "./lib/housekeeping.js";
import { reportServerError } from "./lib/reportServerError.js";
import { droneRoutes } from "./routes/drones.js";
import { authRoutes } from "./routes/auth.js";
import { fleetRoutes } from "./routes/fleet.js";
import { missionRoutes } from "./routes/missions.js";
import { geofenceRoutes } from "./routes/geofence.js";
import { wsRoutes, hasClients, broadcastDrones } from "./routes/ws.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";

const app = Fastify({
  loggerInstance: logger,
});

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

await app.register(cors, {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
});

app.setErrorHandler(reportServerError);

await app.register(websocket, {});
await app.register(wsRoutes);
await app.register(authRoutes);
await app.register(droneRoutes);
await app.register(fleetRoutes);
await app.register(missionRoutes);
await app.register(geofenceRoutes);

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? 4000);
const host = "0.0.0.0";

const address = await app.listen({ port, host });
app.log.info(`API on ${address}`);

const simulationTimer = startSimulation(broadcastDrones, hasClients);
const housekeepingTimer = startHousekeeping();
app.log.info("Background processes started: simulation, housekeeping");

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, starting graceful shutdown...`);

  clearInterval(simulationTimer);
  clearInterval(housekeepingTimer);
  app.log.info("Background timers stopped");

  await app.close();
  app.log.info("HTTP server closed");

  await prisma.$disconnect();
  app.log.info("Database disconnected");

  process.exit(0);
};

process.on("SIGTERM", () => {
  process.stdout.write(">>> SIGTERM RECEIVED <<<\n");
  shutdown("SIGTERM");
});
process.on("SIGINT", () => shutdown("SIGINT"));
