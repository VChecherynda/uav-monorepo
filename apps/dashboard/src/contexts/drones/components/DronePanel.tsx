import type { Drone } from "@uav/shared";
import { useSendCommand } from "@/contexts/fleet-commands";

type DronePanelProps = {
  drones: Drone[];
  onCardClick: (id: string) => void;
};

export const DronePanel = ({ drones, onCardClick }: DronePanelProps) => {
  return (
    <div className="flex flex-col gap-4">
      {drones.map((drone) => (
        <DroneCard key={drone.id} drone={drone} onCardClick={onCardClick} />
      ))}
    </div>
  );
};

function DroneCard({
  drone,
  onCardClick,
}: {
  drone: Drone;
  onCardClick: (id: string) => void;
}) {
  const sendCmd = useSendCommand(); // ← свій інстанс для КОЖНОЇ карточки

  return (
    <div
      onClick={() => onCardClick(drone.id)}
      className="flex items-center rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
    >
      <div className="flex-1 text-sm text-gray-700">
        <div>
          <span className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Position
          </span>
          {drone.lat.toFixed(4)}, {drone.lng.toFixed(4)}
        </div>
        <div>
          <span className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Altitude
          </span>
          {drone.altitude} m
        </div>
        <div>
          <span className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Battery
          </span>
          {drone.battery}%
        </div>
        <div>
          <span className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
            Status
          </span>
          {drone.status}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <button
          disabled={sendCmd.isPending}
          onClick={(e) => {
            e.stopPropagation(); // щоб клік на кнопці не тригерив onCardClick
            sendCmd.mutate({ id: drone.id, action: "return-home" });
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendCmd.isPending ? "Sending…" : "Return home"}
        </button>
        {sendCmd.isError && (
          <p className="text-red-500 text-xs">{sendCmd.error.message}</p>
        )}
        {sendCmd.isSuccess && (
          <p className="text-green-500 text-xs">Drone sent</p>
        )}
      </div>
    </div>
  );
}
