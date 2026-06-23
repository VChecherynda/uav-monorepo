"use client";

import type { Mission, MissionStatus } from "@uav/shared";
import { useDronesStore } from "@/contexts/drones";
import { useAssignMission } from "../hooks/useAssignMission";
import { useState } from "react";
import { useStartMission } from "../hooks/useStartMission";
import { useAbortMission } from "../hooks/useAbortMission";
import { useCompleteMission } from "../hooks/useCompleteMission";

type MissionAction = "assign" | "start" | "abort" | "complete";

const MISSION_ACTIONS: Partial<Record<MissionStatus, MissionAction[]>> = {
  assigned: ["start", "abort"],
  "in-progress": ["abort", "complete"],
};

export const MissionCard = ({ mission }: { mission: Mission }) => {
  const serverDrones = useDronesStore((s) => s.serverDrones);
  const assign = useAssignMission();
  const start = useStartMission();
  const complete = useCompleteMission();
  const abort = useAbortMission();

  const idleDrones = serverDrones.filter((d) => d.status === "idle");
  const [selectedDroneId, setSelectedDroneId] = useState<string>("");

  let actions;
  switch (mission.status) {
    case "draft":
      actions = (
        <div className="flex flex-col gap-2">
          <select
            className="input-tactical"
            value={selectedDroneId}
            onChange={(e) => setSelectedDroneId(e.target.value)}
          >
            <option value="">Please select drone</option>
            {idleDrones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            className="btn-rth px-3 py-1 text-xs rounded border self-start"
            disabled={!selectedDroneId || assign.isPending}
            onClick={() =>
              assign.mutate({ id: mission.id, droneId: selectedDroneId })
            }
          >
            Assign
          </button>
          {assign.error && (
            <span className="error-message">{assign.error.message}</span>
          )}
        </div>
      );
      break;
    case "assigned":
    case "in-progress": {
      const statusActions = MISSION_ACTIONS[mission.status] ?? [];
      actions = statusActions.map((a) => {
        let mutation;
        let label;

        switch (a) {
          case "start":
            mutation = start;
            label = "Start";
            break;
          case "abort":
            mutation = abort;
            label = "Abort";
            break;
          case "complete":
            mutation = complete;
            label = "Complete";
            break;
          default:
            return null;
        }

        return (
          <div key={a}>
            <button
              className="btn-rth px-3 py-1 text-xs rounded border"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(mission.id)}
            >
              {label}
            </button>
            {mutation.error && (
              <span className="error-message">{mutation.error.message}</span>
            )}
          </div>
        );
      });
      break;
    }
    case "completed":
    case "aborted":
      actions = null;
      break;
    default:
      actions = null;
  }

  return (
    <div className="drone-card flex flex-col gap-3 rounded border px-4 py-3">
      <p className="label">Mission: {mission.status}</p>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
};
