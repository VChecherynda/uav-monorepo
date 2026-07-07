"use client";
import {
  ConnectionBadge,
  DroneMarkersLayer,
  DronePanel,
} from "@/contexts/drones";
import { useRealtimeChannel } from "@/infrastructure/realtime";
import { BatteryChart } from "@/contexts/telemetry";
import { LogoutButton } from "@/contexts/auth";
import { MissionPanel, MissionRouteLayer } from "@/contexts/missions";
import { CrosshairIcon, SignalLostIcon } from "@/components";
import { useState } from "react";
import { MapCanvas } from "@/infrastructure/map";
import { RouteDraftLayer } from "@/contexts/routes";

type Tab = "drones" | "missions";

export default function Home() {
  const { status, reconnect } = useRealtimeChannel();
  const [activeTab, setActiveTab] = useState<Tab>("drones");

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
                color: "var(--accent-critical)",
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
            <MapCanvas>
              <DroneMarkersLayer />
              <MissionRouteLayer />
              <RouteDraftLayer />
            </MapCanvas>
          </main>

          <aside className="col-span-4 row-span-1 flex flex-col gap-3 overflow-auto p-3 border border-subtle">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("drones")}
                className={`btn-tab px-3 py-1 rounded border ${activeTab === "drones" ? "active" : ""}`}
              >
                Drones
              </button>
              <button
                onClick={() => setActiveTab("missions")}
                className={`btn-tab px-3 py-1 rounded border ${activeTab === "missions" ? "active" : ""}`}
              >
                Missions
              </button>
            </div>

            {activeTab === "drones" && <DronePanel />}
            {activeTab === "missions" && <MissionPanel />}
          </aside>
        </>
      )}

      <section className="col-span-12 border-t border-subtle bg-surface flex flex-col justify-center px-4">
        <BatteryChart />
      </section>
    </div>
  );
}
