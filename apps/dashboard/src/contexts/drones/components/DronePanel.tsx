"use client";

import type { Drone } from "@uav/shared";
import { useSendCommand } from "@/contexts/fleet-commands";
import { predictDroneChange } from "@/contexts/fleet-commands";
import { useDrones } from "../hooks/useDrones";
import { useDronesStore } from "../stores/useDronesStore";

const STATUS_DOT: Record<Drone["status"], { color: string; glow: string }> = {
  active: { color: "var(--accent-ok)", glow: "var(--glow-ok)" },
  idle: { color: "var(--text-muted)", glow: "none" },
  offline: { color: "var(--accent-critical)", glow: "var(--glow-critical)" },
  returning: { color: "var(--accent-warn)", glow: "var(--glow-warn)" },
};

function StatusDot({ status }: { status: Drone["status"] }) {
  const { color, glow } = STATUS_DOT[status];
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: glow !== "none" ? `0 0 6px ${glow}` : undefined,
        flexShrink: 0,
      }}
    />
  );
}

function getBatteryLevel(value: number) {
  if (value < 20) return "var(--accent-critical)";
  if (value < 40) return "var(--accent-warn)";
  return "var(--accent-info)";
}

function BatteryBar({ value }: { value: number }) {
  const color = getBatteryLevel(value);

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ width: 64, background: "var(--bg-elevated)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums">{value}%</span>
    </div>
  );
}

export const DronePanel = () => {
  const drones = useDrones();
  const selectDrone = useDronesStore((s) => s.selectDrone);

  return (
    <div className="flex flex-col gap-4">
      {drones.map((drone) => (
        <DroneCard key={drone.id} drone={drone} onCardClick={selectDrone} />
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
  const sendCmd = useSendCommand();
  const isSelected = useDronesStore((s) => s.droneId === drone.id);
  const canReturnHome =
    predictDroneChange("return-home", drone.status) !== undefined;

  return (
    <div
      onClick={() => onCardClick(drone.id)}
      className={`drone-card flex flex-col gap-3 rounded border px-4 py-3 cursor-pointer ${
        isSelected ? "selected" : ""
      }`}
      style={{
        borderLeft: isSelected
          ? "3px solid var(--accent-info)"
          : "3px solid transparent",
      }}
    >
      {/* Top row — identity + battery */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={drone.status} />
          <span className="text-sm font-semibold truncate text-primary">
            {drone.name}
          </span>
        </div>
        <BatteryBar value={drone.battery} />
      </div>

      {/* Bottom row — telemetry data */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="label">Position</span>
          <span className="text-data">
            {drone.lat.toFixed(3)}, {drone.lng.toFixed(3)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="label">Alt</span>
          <span className="text-data">{drone.altitude}m</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="label">Status</span>
          <span className="text-data">{drone.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Command row */}
      <div className="flex items-center justify-between">
        <button
          disabled={sendCmd.isPending || !canReturnHome}
          onClick={(e) => {
            e.stopPropagation();
            sendCmd.mutate({ id: drone.id, action: "return-home" });
          }}
          className="btn-rth px-3 py-1 text-xs rounded border"
        >
          {sendCmd.isPending ? "SENDING..." : "RTH"}
        </button>

        {sendCmd.data?.status === "rejected" && (
          <span className="font-mono text-xs text-critical">
            {sendCmd.data.reason.message}
          </span>
        )}

        {sendCmd.data?.status === "success" && (
          <span className="font-mono text-xs text-ok">ACKNOWLEDGED</span>
        )}
      </div>
    </div>
  );
}
