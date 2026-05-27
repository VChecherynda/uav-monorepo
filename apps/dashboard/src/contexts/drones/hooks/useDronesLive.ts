import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/contexts/auth";
import { useDronesStore } from "@/contexts/drones";
import type { WSConnectionStatus, WSMessage } from "@uav/shared";
import { useNotificationsStore } from "@/contexts/notifications/stores/useNotificationsStore";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/drones";

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY = 16000;
const HEARTBEAT_TIMEOUT_MS = 6000;

export function useDronesLive() {
  const serverDrones = useDronesStore((s) => s.serverDrones);
  const optimisticOverrides = useDronesStore((s) => s.optimisticOverrides);
  const setServerDrones = useDronesStore((s) => s.setServerDrones);

  const [status, setStatus] = useState<WSConnectionStatus>("connecting");
  const [retryTrigger, setRetryTrigger] = useState(0);

  const token = useAuthStore((s) => s.token);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef<number>(0);

  const drones = useMemo(
    () =>
      serverDrones.map((drone) => {
        const override = optimisticOverrides.get(drone.id);
        return override ? { ...drone, ...override } : drone;
      }),
    [serverDrones, optimisticOverrides],
  );

  useEffect(() => {
    let cancelled = false;

    function resetHeartbeat(ws: WebSocket) {
      if (heartbeatTimerRef.current) {
        clearTimeout(heartbeatTimerRef.current);
      }

      heartbeatTimerRef.current = setTimeout(() => {
        console.warn("[WS] heartbeat timeout - connection appears dead");
        ws.close();
      }, HEARTBEAT_TIMEOUT_MS);
    }

    function connect() {
      if (!token) {
        return;
      }

      const wsURL = `${WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsURL);

      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        retryRef.current = 0;
        console.log("[WS] open");
        setStatus("open");
        resetHeartbeat(ws);
      };

      ws.onmessage = (event) => {
        resetHeartbeat(ws);

        try {
          const message = JSON.parse(event.data) as WSMessage;

          switch (message.type) {
            case "drones:snapshot":
              setServerDrones(message.data);
              break;
            case "DroneCommandRejected":
            case "BatteryCritical":
            case "DroneRecovered":
              useNotificationsStore.getState().addNotification(message);
              break;
          }
        } catch (e) {
          console.error("Bad WS payload", e);
        }
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        console.log("[WS] close", event.code, event.reason);

        if (heartbeatTimerRef.current) {
          clearTimeout(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        if (event.code === 4001) {
          useAuthStore.getState().logout();
          return;
        }

        setStatus("reconnecting");

        if (retryRef.current >= MAX_RETRIES) {
          setStatus("lost");
          return;
        }

        const delay = Math.min(1000 * 2 ** retryRef.current, MAX_RETRY_DELAY);
        retryRef.current++;

        retryTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;

      if (heartbeatTimerRef.current) {
        clearTimeout(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      wsRef.current?.close();
    };
  }, [token, retryTrigger, setServerDrones]);

  const reconnect = () => {
    retryRef.current = 0;
    setRetryTrigger((n) => n + 1); // ← змінює deps → useEffect re-runs
  };

  return {
    drones,
    status,
    reconnect,
  };
}
