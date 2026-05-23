import { create } from "zustand";
import { DomainEvent } from "@uav/shared";

export type Notification = {
  id: string;
  event: DomainEvent;
  at: string;
  read: boolean;
};

type NotificationStore = {
  notifications: Notification[];

  addNotification: (event: DomainEvent) => void;

  clearAll: () => void;
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
        },
        ...state.notifications,
      ].slice(0, 50),
    })),

  clearAll: () => {
    set({ notifications: [] });
  },
}));
