"use client";
import {
  ConnectionBadge,
  DroneMap,
  DronePanel,
  useDronesLive,
} from "@/contexts/drones";
import { BatteryChart } from "@/contexts/telemetry";
import { LogoutButton } from "@/contexts/auth";
import { NotificationsFeed } from "@/contexts/notifications";
import { ResetFleetButton } from "@/contexts/fleet";

import { useState } from "react";

export default function Home() {
  const { drones, status, reconnect } = useDronesLive();
  const [droneId, setDroneId] = useState<string | null>(null);

  const onCardClick = (id: string) => {
    setDroneId(id);
  };

  return (
    <div className="grid grid-cols-12 grid-rows-[60px_1fr_200px] h-screen gap-4 p-2">
      <header className="col-span-12 flex items-center justify-between px-4">
        <h1>UAV Fleet</h1>
        <ConnectionBadge status={status} />
        <div className="flex gap-2">
          <ResetFleetButton />
          <LogoutButton />
        </div>
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
            <NotificationsFeed />
          </aside>
        </>
      )}

      <section className="col-span-12">
        <BatteryChart droneId={droneId} />
      </section>
    </div>
  );
}
