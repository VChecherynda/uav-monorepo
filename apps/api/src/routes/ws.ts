import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import type { WSMessage, Drone, DomainEvent } from '@uav/shared';
import {
  authenticateWs,
  authenticateUnitMember,
  requireActor,
} from '../lib/auth.js';

const HEARTBEAT_INTERVAL_MS = 10_000;

type ClientState = { unitId: string; isAlive: boolean };

const clientUnits = new Map<WebSocket, ClientState>();

export const hasClients = () => {
  return clientUnits.size > 0;
};

export const startHeartbeat = () => {
  return setInterval(() => {
    for (const [client, state] of clientUnits) {
      if (state.isAlive === false) {
        client.terminate();
      } else {
        state.isAlive = false;
        client.ping();
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
};

export async function wsRoutes(app: FastifyInstance) {
  app.get(
    '/ws/drones',
    { preHandler: [authenticateWs, authenticateUnitMember], websocket: true },
    (socket, req) => {
      const actor = requireActor(req);
      clientUnits.set(socket, { unitId: actor.unitId, isAlive: true });

      socket.on('close', () => {
        app.log.info('WS client disconnected');
        clientUnits.delete(socket);
      });

      socket.on('error', (err: Error) => {
        app.log.error({ err }, 'WS error');
        clientUnits.delete(socket);
      });

      socket.on('pong', () => {
        const state = clientUnits.get(socket);
        if (state) {
          state.isAlive = true;
        }
      });
    },
  );
}

export function broadcastDrones(drones: Drone[]) {
  if (clientUnits.size === 0) return;

  for (const [client, state] of clientUnits) {
    const unitDrones = drones.filter((d) => d.unitId === state.unitId);

    const payload: WSMessage = {
      type: 'drones:snapshot',
      data: unitDrones,
    };
    const serialized = JSON.stringify(payload);

    if (client.readyState === 1) {
      client.send(serialized);
    }
  }
}

export function broadcastEvent(
  event: DomainEvent,
  drone: Pick<Drone, 'unitId'>,
) {
  if (drone.unitId === null || clientUnits.size === 0) return;

  const payload: WSMessage = event;
  const serialized = JSON.stringify(payload);

  for (const [client, state] of clientUnits) {
    if (state.unitId !== drone.unitId) continue;
    if (client.readyState === 1) {
      client.send(serialized);
    }
  }
}
