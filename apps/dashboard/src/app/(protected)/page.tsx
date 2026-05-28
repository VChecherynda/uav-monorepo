"use client";
import {
  ConnectionBadge,
  DroneMap,
  DronePanel,
  useDronesLive,
} from "@/contexts/drones";
import { BatteryChart } from "@/contexts/telemetry";
import { LogoutButton } from "@/contexts/auth";
import { ResetFleetButton } from "@/contexts/fleet";

import { useState } from "react";

function CrosshairIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--accent-info)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="14"
        cy="14"
        r="4"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="8"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="20"
        x2="14"
        y2="26"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="2"
        y1="14"
        x2="8"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="14"
        x2="26"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Home() {
  const { drones, status, reconnect } = useDronesLive();
  const [droneId, setDroneId] = useState<string | null>(null);

  const onCardClick = (id: string) => {
    setDroneId(id);
  };

  return (
    <div className="grid grid-cols-12 grid-rows-[60px_1fr_200px] h-screen gap-4 p-2">
      {/* Left block */}
      <header className="col-span-12 flex items-center justify-between px-4 border-b border-subtle bg-surface">
        <div className="flex items-center gap-3">
          <CrosshairIcon />
          <div className="flex flex-col">
            <span
              className="text-xs font-semibold tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary",
              }}
            >
              UAV FLEET
            </span>
          </div>
        </div>

        {/* Center block */}
        <ConnectionBadge status={status} />

        {/* Right block */}
        <LogoutButton />
      </header>

      {status === "lost" ? (
        <main className="col-span-12 row-span-1">
          <div className="flex flex-col items-center gap-4 p-8 text-slate-400">
            <p>Connection lost. Unable to reach server.</p>
            <button
              onClick={reconnect}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      ) : (
        <>
          {" "}
          <main className="col-span-8 row-span-1">
            <DroneMap drones={drones} />
          </main>
          <aside className="col-span-4 row-span-1 gap-4 overflow-auto">
            <DronePanel drones={drones} onCardClick={onCardClick} />
          </aside>
        </>
      )}

      <section className="col-span-12">
        <BatteryChart droneId={droneId} />
      </section>
    </div>
  );
}
