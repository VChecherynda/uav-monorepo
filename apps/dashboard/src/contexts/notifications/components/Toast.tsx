"use client";

import { useEffect } from "react";
import { TOAST_COLORS, TOAST_DURATION, TOAST_LABELS } from "../constants";
import { useNotificationsStore } from "../stores/useNotificationsStore";
import type { Notification } from "../stores/useNotificationsStore";
import { useDronesStore } from "@/contexts/drones";

type ToastProps = {
  notification: Notification;
};

export function Toast({ notification }: ToastProps) {
  const { id, event, severity } = notification;
  const removeOne = useNotificationsStore((s) => s.removeNotification);
  const duration = TOAST_DURATION[severity];
  const colors = TOAST_COLORS[severity];

  useEffect(() => {
    if (duration === null) return;
    const timer = setTimeout(() => {
      removeOne(id);
    }, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, removeOne]);

  return (
    <div
      style={{
        borderLeft: `3px solid ${colors.border}`,
        boxShadow:
          colors.glow !== "none" ? `0 0 12px ${colors.glow}` : undefined,
      }}
      className="relative flex flex-col gap-1
      bg-surface border border-subtle
      rounded px-4 py-3 w-80
      animate-in fade-in slide-in-from-right-4 duration-200"
    >
      <span className="label" style={{ color: colors.border }}>
        {TOAST_LABELS[event.type]}
      </span>

      <ToastMessage event={event} />

      <button
        onClick={() => removeOne(id)}
        className="absolute top-2 right-2 text-muted hover:text-primary transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

function ToastMessage({ event }: { event: Notification["event"] }) {
  const drone = useDronesStore((s) =>
    s.serverDrones.find((d) => d.id === event.droneId),
  );
  const droneName = drone?.name ?? "Unknown drone";

  if (event.type === "BatteryCritical") {
    return (
      <p className="text-sm text-primary font-mono">
        Drone {droneName} - {event.battery}% battery
      </p>
    );
  }

  if (event.type === "DroneCommandRejected") {
    return <p className="text-sm text-primary">{event.reason.message}</p>;
  }

  return (
    <p className="text-sm text-secondary">Drone {droneName} - return to base</p>
  );
}
