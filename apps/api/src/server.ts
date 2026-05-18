import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { startSimulation } from "./lib/simulation.js";
import { droneRoutes } from "./routes/drones.js";
import { authRoutes } from "./routes/auth.js";
import { wsRoutes, broadcastDrones } from "./routes/ws.js";

// TEMP: Generate fake data
startSimulation(broadcastDrones);

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

app.listen({ port, host }).then((address) => console.log(`API on ${address}`));
