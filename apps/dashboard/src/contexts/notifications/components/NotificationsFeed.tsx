"use client";

import { useNotificationsStore } from "../stores/useNotificationsStore";
import { useDronesStore } from "@/contexts/drones";
import type { Notification } from "../stores/useNotificationsStore";

function NotificationItem({ notification }: { notification: Notification }) {
  const { event } = notification;
  const drone = useDronesStore((s) =>
    s.serverDrones.find((d) => d.id === event.droneId),
  );
  const droneName = drone?.name ?? "Unknown drone";

  if (event.type === "BatteryCritical") {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        🔋 <strong>Battery critical</strong> - {droneName} has {event.battery}%
      </div>
    );
  }

  if (event.type === "DroneCommandRejected") {
    return (
      <div className="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
        ⚠️ {droneName}: <strong>{event.action}</strong> rejected —{" "}
        {event.reason.message}
      </div>
    );
  }

  if (event.type === "DroneRecovered") {
    return (
      <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
        🔄 <strong>Auto-recovery</strong> — {droneName} returned to home base
      </div>
    );
  }

  return null;
}

export function NotificationsFeed() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  if (notifications.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Events
        </span>

        <button
          onClick={clearAll}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      </div>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
