import type { FastifyInstance } from 'fastify';
import type { WSMessage, Drone, DomainEvent } from '@uav/shared';
import {
  authenticateWs,
  authenticateUnitMember,
  requireActor,
} from '../lib/auth.js';

const clientUnits = new Map<WebSocket, string>();

export const hasClients = () => {
  return clientUnits.size > 0;
};

export async function wsRoutes(app: FastifyInstance) {
  app.get(
    '/ws/drones',
    { preHandler: [authenticateWs, authenticateUnitMember], websocket: true },
    (socket, req) => {
      const actor = requireActor(req);
      clientUnits.set(socket, actor.unitId);

      socket.on('close', () => {
        app.log.info('WS client disconnected');
        clientUnits.delete(socket);
      });

      socket.on('error', (err: Error) => {
        app.log.error({ err }, 'WS error');
        clientUnits.delete(socket);
      });
    },
  );
}

export function broadcastDrones(drones: Drone[]) {
  if (clientUnits.size === 0) return;

  for (const [client, unitId] of clientUnits) {
    const unitDrones = drones.filter((d) => d.unitId === unitId);

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

  for (const [client, unitId] of clientUnits) {
    if (unitId !== drone.unitId) continue;
    if (client.readyState === 1) {
      client.send(serialized);
    }
  }
}
