"use client";
import {
  BatteryChart,
  ConnectionBadge,
  DroneMap,
  DronePanel,
} from "@/app/components";
import { useDronesLive } from "@/hooks/useDronesLive";
import { useState } from "react";

export default function Home() {
  const { drones, status } = useDronesLive();
  const [droneId, setDroneId] = useState<string | undefined>();

  const onCardClick = (id: string) => {
    setDroneId(id);
  };

  return (
    <div className="grid grid-cols-12 grid-rows-[60px_1fr_200px] h-screen gap-4 p-2">
      <header className="col-span-12 flex items-center justify-between px-4">
        <h1>UAV Fleet</h1>
        <ConnectionBadge status={status} />
      </header>
      <main className="col-span-8 row-span-1">
        <DroneMap drones={drones} />
      </main>
      <aside className="col-span-4 row-span-1 gap-4 overflow-auto">
        <DronePanel drones={drones} onCardClick={onCardClick} />
      </aside>
      <section className="col-span-12">
        <BatteryChart droneId={droneId} />
      </section>
    </div>
  );
}
