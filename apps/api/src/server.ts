import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { startSimulation } from "./lib/simulation.js";
import { startHousekeeping } from "./lib/housekeeping.js";
import { droneRoutes } from "./routes/drones.js";
import { authRoutes } from "./routes/auth.js";
import { wsRoutes, broadcastDrones } from "./routes/ws.js";
import { prisma } from "./lib/prisma.js";

const app = Fastify({
  logger:
    process.env.NODE_ENV === "production"
      ? true
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        },
});

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

await app.register(cors, { origin: allowedOrigins });

await app.register(websocket, {});
await app.register(wsRoutes);
await app.register(authRoutes);
await app.register(droneRoutes);

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? 4000);
const host = "0.0.0.0";

const address = await app.listen({ port, host });
app.log.info(`API on ${address}`);

const simulationTimer = startSimulation(broadcastDrones);
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

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
