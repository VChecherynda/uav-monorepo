"use client";

import { useNotificationsStore } from "../stores/useNotificationsStore";
import { Toast } from "./Toast";

export function Toaster() {
  const notifications = useNotificationsStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} />
      ))}
    </div>
  );
}
