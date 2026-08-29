"use client";

import { useDronesStore } from "@/contexts/drones";
import { PlanRouteButton, useRouteDraftStore } from "@/contexts/routes";
import { useAssignMission } from "../hooks/useAssignMission";
import { useState } from "react";
import { useStartMission } from "../hooks/useStartMission";
import { useAbortMission } from "../hooks/useAbortMission";
import { useCompleteMission } from "../hooks/useCompleteMission";
import { useReplaceWaypoints } from "../hooks/useReplaceWaypoints";
import { useMissionsStore } from "../stores/useMissionsStore";
import { useRestoreMission } from "../hooks/useRestoreMission";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Drone, Mission, MissionStatus } from "@uav/shared";

type MissionAction =
  | "assign"
  | "start"
  | "abort"
  | "complete"
  | "save"
  | "restore";
type ButtonAction = (typeof MISSION_ACTIONS)[MissionStatus][number];
type ActionRejection = { error: Error | null; submittedAt: number };
type MissionMutation = UseMutationResult<
  { status: "success"; mission: Mission; drone: Drone },
  Error,
  string
>;

const MISSION_ACTIONS = {
  draft: [],
  assigned: ["start", "abort"],
  "in-progress": ["abort", "complete"],
  completed: [],
  aborted: [],
} as const satisfies Record<MissionStatus, readonly MissionAction[]>;

const ACTION_LABEL: Record<MissionAction, string> = {
  assign: "ASSIGN",
  start: "START",
  abort: "ABORT",
  complete: "COMPLETE",
  save: "SAVE",
  restore: "RESTORE",
};

const STATUS_COLOR: Record<MissionStatus, string> = {
  draft: "var(--text-muted)",
  assigned: "var(--accent-info)",
  "in-progress": "var(--accent-ok)",
  completed: "var(--text-secondary)",
  aborted: "var(--accent-critical)",
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
  const restore = useRestoreMission();

  const ACTION_ENTRY: Record<
    ButtonAction,
    { label: string; mutation: MissionMutation }
  > = {
    start: { label: ACTION_LABEL.start, mutation: start },
    abort: { label: ACTION_LABEL.abort, mutation: abort },
    complete: { label: ACTION_LABEL.complete, mutation: complete },
  };

  const STATUS_ENTRIES: Record<
    MissionStatus,
    readonly { action: MissionAction; mutation: ActionRejection }[]
  > = {
    draft: [
      { action: "assign", mutation: assign },
      { action: "save", mutation: replace },
    ],
    assigned: [
      { action: "start", mutation: start },
      { action: "abort", mutation: abort },
    ],
    "in-progress": [
      { action: "abort", mutation: abort },
      { action: "complete", mutation: complete },
    ],
    aborted: [{ action: "restore", mutation: restore }],
    completed: [],
  };

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
  const latest = STATUS_ENTRIES[mission.status].reduce<{
    action: MissionAction;
    mutation: ActionRejection;
  } | null>(
    (freshest, entry) =>
      freshest === null ||
      entry.mutation.submittedAt > freshest.mutation.submittedAt
        ? entry
        : freshest,
    null,
  );

  const rejection = latest?.mutation.error
    ? `${ACTION_LABEL[latest.action].toLowerCase()}: ${latest.mutation.error.message}`
    : null;

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

          <div className="flex flex-wrap gap-2">
            <PlanRouteButton missionId={mission.id} />
            <div className="flex flex-col gap-1 min-w-0">
              <button
                className="btn-rth px-3 py-1 text-xs rounded border"
                disabled={!selectedDroneId || assign.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  assign.mutate({ id: mission.id, droneId: selectedDroneId });
                }}
              >
                ASSIGN
              </button>
            </div>
            {canSave && (
              <div className="flex flex-col gap-1 min-w-0">
                <button
                  className="btn-rth px-3 py-1 text-xs rounded border"
                  disabled={replace.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    replace.mutate(mission.id);
                  }}
                >
                  SAVE
                </button>
              </div>
            )}
          </div>
        </div>
      );
      break;
    case "assigned":
    case "in-progress": {
      const statusActions = MISSION_ACTIONS[mission.status] ?? [];
      actions = statusActions.map((a) => {
        const { label, mutation } = ACTION_ENTRY[a];

        return (
          <div key={a} className="flex flex-col gap-1 min-w-0">
            <button
              className="btn-rth px-3 py-1 text-xs rounded border self-start"
              disabled={mutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate(mission.id);
              }}
            >
              {label}
            </button>
          </div>
        );
      });
      break;
    }
    case "aborted":
      actions = (
        <div className="flex flex-col gap-1 min-w-0">
          <button
            className="btn-rth px-3 py-1 text-xs rounded border self-start"
            disabled={restore.isPending}
            onClick={(e) => {
              e.stopPropagation();
              restore.mutate(mission.id);
            }}
          >
            RESTORE
          </button>
        </div>
      );
      break;
    case "completed":
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
        <span
          className="status-badge self-start"
          style={{ color: STATUS_COLOR[mission.status] }}
        >
          {mission.status}
        </span>
        <p className="text-data">{droneLabel}</p>
      </div>

      <div className="flex gap-2">{actions}</div>
      <div className="flex">
        {rejection && (
          <span className="error-message truncate" title={rejection}>
            {rejection}
          </span>
        )}
      </div>
    </div>
  );
};
