"use client";

import { useMissions } from "../hooks/useMissions";
import { useMissionsStore } from "../stores/useMissionsStore";

import { MissionCard } from "./MissionCard";

export const MissionPanel = () => {
  const { isLoading, error } = useMissions();
  const missions = useMissionsStore((s) => s.missions);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {missions.map((m) => (
        <MissionCard key={m.id} mission={m} />
      ))}
    </div>
  );
};
