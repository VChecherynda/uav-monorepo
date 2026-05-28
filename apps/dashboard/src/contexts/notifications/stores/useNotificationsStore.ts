import { create } from "zustand";
import { DomainEvent } from "@uav/shared";
import { noDeprecation } from "process";

export type Notification = {
  id: string;
  event: DomainEvent;
  at: string;
  read: boolean;
  severity: "info" | "warn" | "critical";
};

type NotificationStore = {
  notifications: Notification[];

  addNotification: (event: DomainEvent) => void;

  removeNotification: (id: string) => void;

  clearAll: () => void;
};

const SEVERITY: Record<DomainEvent["type"], Notification["severity"]> = {
  BatteryCritical: "critical",
  DroneCommandRejected: "warn",
  DroneRecovered: "info",
};

export const useNotificationsStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (event) =>
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          event,
          at: event.at,
          read: false,
          severity: SEVERITY[event.type],
        },
        ...state.notifications,
      ].slice(0, 50),
    })),

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));
