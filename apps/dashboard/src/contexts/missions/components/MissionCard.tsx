"use client";

import type { Drone, Mission, MissionStatus } from "@uav/shared";
import { useDronesStore } from "@/contexts/drones";
import { PlanRouteButton, useRouteDraftStore } from "@/contexts/routes";
import { useAssignMission } from "../hooks/useAssignMission";
import { useState } from "react";
import { useStartMission } from "../hooks/useStartMission";
import { useAbortMission } from "../hooks/useAbortMission";
import { useCompleteMission } from "../hooks/useCompleteMission";
import { useReplaceWaypoints } from "../hooks/useReplaceWaypoints";
import { useMissionsStore } from "../stores/useMissionsStore";

type MissionAction = "assign" | "start" | "abort" | "complete";

const MISSION_ACTIONS: Partial<Record<MissionStatus, MissionAction[]>> = {
  assigned: ["start", "abort"],
  "in-progress": ["abort", "complete"],
};

function getDroneLabel(mission: Mission, drones: Drone[]) {
  if (!mission.droneId) return "Drone is not assigned";

  const drone = drones.find((d) => d.id === mission.droneId);
  if (!drone) return "Assigned drone not found";

  return drone.name;
}

export const MissionCard = ({ mission }: { mission: Mission }) => {
  const serverDrones = useDronesStore((s) => s.serverDrones);
  const replace = useReplaceWaypoints();
  const assign = useAssignMission();
  const start = useStartMission();
  const complete = useCompleteMission();
  const abort = useAbortMission();
  const selectMission = useMissionsStore((s) => s.selectMission);
  const isSelected = useMissionsStore(
    (s) => s.selectedMissionId === mission.id,
  );
  const canSave = useRouteDraftStore(
    (s) => s.planningMissionId === mission.id && s.waypoints.length > 0,
  );

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
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setSelectedDroneId(e.target.value);
            }}
          >
            <option value="">Please select drone</option>
            {idleDrones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <PlanRouteButton missionId={mission.id} />

          <button
            className="btn-rth px-3 py-1 text-xs rounded border self-start"
            disabled={!selectedDroneId || assign.isPending}
            onClick={(e) => {
              e.stopPropagation();
              assign.mutate({ id: mission.id, droneId: selectedDroneId });
            }}
          >
            Assign
          </button>

          {canSave && (
            <button
              className="btn-rth px-3 py-1 text-xs rounded border self-start"
              disabled={replace.isPending}
              onClick={(e) => {
                e.stopPropagation();

                replace.mutate(mission.id);
              }}
            >
              Save
            </button>
          )}

          {assign.error && (
            <span className="error-message">{assign.error.message}</span>
          )}

          {replace.error && (
            <span className="error-message">{replace.error.message}</span>
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
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate(mission.id);
              }}
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

  const droneLabel = getDroneLabel(mission, serverDrones);

  return (
    <div
      className={`card flex flex-col gap-3 rounded border px-4 py-3 cursor-pointer ${isSelected ? "selected" : ""}`}
      onClick={() => {
        selectMission(mission.id);
      }}
      style={{
        borderLeft: isSelected
          ? "3px solid var(--accent-info)"
          : "3px solid transparent",
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold truncate text-primary">
          {mission.name}
        </p>
        <p className="label">{mission.status}</p>
        <p className="text-data">{droneLabel}</p>
      </div>

      <div className="flex gap-2">{actions}</div>
    </div>
  );
};
