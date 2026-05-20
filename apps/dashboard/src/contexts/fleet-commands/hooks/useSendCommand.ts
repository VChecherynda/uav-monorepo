import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendCommand,
  type DroneAction,
} from "@/contexts/fleet-commands/api/sendCommand";

type Vars = { id: string; action: DroneAction };

export const useSendCommand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: Vars) => sendCommand(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drones"] });
    },
  });
};
