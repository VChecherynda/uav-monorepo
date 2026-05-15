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
  logger: {
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

await app.register(cors, { origin: "http://localhost:3000" });

await app.register(websocket, {});
await app.register(wsRoutes);
await app.register(authRoutes);
await app.register(droneRoutes);

app.listen({ port: 4000 }).then(() => console.log("API on :4000"));
