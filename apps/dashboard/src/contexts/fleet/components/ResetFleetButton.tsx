"use client";

import { useResetFleet } from "../hooks/useResetFleet";

export function ResetFleetButton() {
  const { isPending, isError, error, mutate } = useResetFleet();

  const handleClick = () => {
    if (
      !confirm(
        "Reset entire fleet to home positions? This will clear all telemetry.",
      )
    ) {
      return;
    }

    mutate();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded border border-orange-700 px-3 py-1 text-sm text-orange-300 hover:bg-orange-950 disabled:opacity-50"
      >
        Reset fleet
      </button>
      {isError && <p className="text-red-500 text-xs">{error.message}</p>}
    </div>
  );
}
