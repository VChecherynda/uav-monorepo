import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

import type { FastifyInstance } from "fastify";
import type { WSMessage, Drone } from "@uav/shared";

const clients = new Set<WebSocket>();

export const hasClients = () => {
  return clients.size > 0;
};

export async function wsRoutes(app: FastifyInstance) {
  app.get("/ws/drones", { websocket: true }, (socket, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      socket.close(4001, "Unauthorized: no token");
      return;
    }

    try {
      jwt.verify(
        token,
        process.env.JWT_SECRET ?? "dev-secret-change-in-production",
      );
    } catch {
      socket.close(4001, "Unauthorized: invalid token");
      return;
    }

    clients.add(socket);

    socket.on("close", () => {
      app.log.info("WS client disconnected");
      clients.delete(socket);
    });

    socket.on("error", (err: Error) => {
      app.log.error({ err }, "WS error");
      clients.delete(socket);
    });
  });
}

export async function broadcastDrones() {
  if (clients.size === 0) return;

  const drones = await prisma.drone.findMany({
    orderBy: { name: "asc" },
  });
  const payload: WSMessage = {
    type: "drones:update",
    data: drones as Drone[],
  };

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  }
}
