import type { WSMessage } from "@uav/shared";
import { useDronesStore } from "@/contexts/drones";
import { useNotificationsStore } from "@/contexts/notifications";

export function routeMessage(message: WSMessage) {
  switch (message.type) {
    case "drones:snapshot":
      useDronesStore.getState().setServerDrones(message.data);
      break;
    case "DroneCommandRejected":
    case "BatteryCritical":
    case "DroneRecovered":
      useNotificationsStore.getState().addNotification(message);
      break;
  }
}
