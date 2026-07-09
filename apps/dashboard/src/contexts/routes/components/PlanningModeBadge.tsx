"use client";

import { useRouteDraftStore } from "../stores/useRouteDraftStore";

export const PlanningModeBadge = () => {
  const cancelPlanning = useRouteDraftStore((s) => s.cancelPlanning);
  const planningMissionId = useRouteDraftStore((s) => s.planningMissionId);

  if (planningMissionId === null) {
    return null;
  }

  return (
    <div
      className="absolute top-3 right-3 z-10 tactical-badge font-mono"
      style={{
        borderColor: "var(--accent-warn)",
      }}
    >
      <span
        className="text-xs tracking-widest"
        style={{ color: "var(--accent-warn)" }}
      >
        PLANNING MODE
      </span>
      <button
        onClick={cancelPlanning}
        className="btn-rth px-3 py-1 text-xs rounded border self-start"
      >
        CANCEL
      </button>
    </div>
  );
};
