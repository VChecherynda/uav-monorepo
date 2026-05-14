import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendCommand } from "@/lib/api";

type Vars = { id: string; action: "return-home" | "land" | "takeoff" };

export const useSendCommand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: Vars) => sendCommand(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drones"] });
    },
  });
};
