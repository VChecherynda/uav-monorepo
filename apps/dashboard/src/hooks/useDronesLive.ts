import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Drone, WSConnectionStatus } from "@/lib/api";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/drones";

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY = 16000;

export function useDronesLive() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [status, setStatus] = useState<WSConnectionStatus>("connecting");
  const [retryTrigger, setRetryTrigger] = useState(0);

  const token = useAuthStore((s) => s.token);

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

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
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "drones:update") {
            setDrones(message.data);
          }
        } catch (e) {
          console.error("Bad WS payload", e);
        }
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        console.log("[WS] close", event.code, event.reason);

        if (event.code === 4001) {
          useAuthStore.getState().logout();
          return;
        }

        if (retryRef.current >= MAX_RETRIES) {
          setStatus("lost");
          return;
        }

        setStatus("reconnecting");

        const delay = Math.min(1000 * 2 ** retryRef.current, MAX_RETRY_DELAY);
        retryRef.current++;

        retryTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      wsRef.current?.close();
    };
  }, [token, retryTrigger]);

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
