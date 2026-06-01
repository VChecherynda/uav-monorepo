"use client";
import {
  ConnectionBadge,
  DroneMap,
  DronePanel,
  useDronesLive,
} from "@/contexts/drones";
import { BatteryChart } from "@/contexts/telemetry";
import { LogoutButton } from "@/contexts/auth";
import { CrosshairIcon } from "@/components/icons/CrosshairIcon";

// import { ResetFleetButton } from "@/contexts/fleet";

import { useState } from "react";

function SignalLostIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
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
    <div className="grid grid-cols-12 grid-rows-[56px_1fr_200px] h-screen bg-deep">
      {/* Left block */}
      <header className="col-span-12 flex items-center justify-between px-4 border-b border-subtle bg-surface">
        <div className="flex items-center gap-3">
          <CrosshairIcon />
          <div className="flex flex-col">
            <span
              className="text-xs font-semibold tracking-[0.2em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
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
        <main className="col-span-12 row-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center gap-2"
              style={{
                color: "var(--accent-critical",
                fontFamily: "var(--font-mono)",
              }}
            >
              <SignalLostIcon />
              <span className="text-sm tracking-wider">SIGNAL LOST</span>
            </div>

            <p
              className="text-xs text-center"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Unable to reach ground station
            </p>

            <button
              onClick={reconnect}
              className="btn-rth px-4 py-2 text-xs rounded border"
            >
              RECONNECT
            </button>
          </div>
        </main>
      ) : (
        <>
          <main className="relative col-span-8 row-span-1 overflow-hidden">
            <div
              className="absolute top-3 left-3 z-10 tactical-badge font-mono pointer-events-none"
              style={{
                borderColor: "var(--accent-warn)",
              }}
            >
              <span
                className="text-xs tracking-widest"
                style={{ color: "var(--accent-warn)" }}
              >
                SIMULATED DATA · DEMO ENVIRONMENT
              </span>
            </div>
            <DroneMap drones={drones} />
          </main>

          <aside className="col-span-4 row-span-1 flex flex-col gap-3 overflow-auto p-3 border border-subtle">
            <DronePanel
              drones={drones}
              selectedId={droneId}
              onCardClick={onCardClick}
            />
          </aside>
        </>
      )}

      <section className="col-span-12 border-t border-subtle bg-surface flex flex-col justify-center px-4">
        <BatteryChart droneId={droneId} />
      </section>
    </div>
  );
}
