import { useEffect, useRef, useState } from "react";
import type { Drone, WSConnectionStatus } from "@/lib/api";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/drones";

export function useDronesLive() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [status, setStatus] = useState<WSConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => {
        if (cancelled) return;
        retryRef.current = 0;
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

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("closed");

        const delay = Math.min(1000 * 2 ** retryRef.current, 16000);
        retryRef.current++;

        setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, []);

  return {
    drones,
    status,
  };
}
