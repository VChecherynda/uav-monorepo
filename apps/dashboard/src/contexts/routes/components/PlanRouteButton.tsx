"use client";

import { useRouteDraftStore } from "../stores/useRouteDraftStore";

export function PlanRouteButton({ missionId }: { missionId: string }) {
  const startPlanning = useRouteDraftStore((s) => s.startPlanning);
  const cancelPlanning = useRouteDraftStore((s) => s.cancelPlanning);
  const planningMissionId = useRouteDraftStore((s) => s.planningMissionId);

  if (planningMissionId === missionId) {
    return (
      <button
        onClick={cancelPlanning}
        className="btn-rth px-3 py-1 text-xs rounded border self-start"
      >
        CANCEL
      </button>
    );
  }

  return (
    <button
      onClick={() => startPlanning(missionId)}
      className="btn-rth px-3 py-1 text-xs rounded border self-start"
    >
      START PLANNING
    </button>
  );
}
