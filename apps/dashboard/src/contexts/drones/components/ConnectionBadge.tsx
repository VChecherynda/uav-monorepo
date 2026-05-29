"use client";

import { WSConnectionStatus } from "@uav/shared";

const STATUS_CONFIG: Record<
  WSConnectionStatus,
  { label: string; color: string; pulse: boolean }
> = {
  connecting: {
    label: "CONNECTING",
    color: "var(--accent-warn)",
    pulse: false,
  },
  open: {
    label: "LIVE",
    color: "var(--accent-ok)",
    pulse: true,
  },
  reconnecting: {
    label: "RECONNECTING",
    color: "var(--accent-warn)",
    pulse: false,
  },
  lost: {
    label: "LOST",
    color: "var(--accent-critical)",
    pulse: false,
  },
};

export const ConnectionBadge = ({ status }: { status: WSConnectionStatus }) => {
  const { label, color, pulse } = STATUS_CONFIG[status];

  return (
    <div className="tactical-badge font-mono">
      <svg width="8" height="8" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="4" fill={color}>
          {pulse && (
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>

      <span className="text-xs tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  );
};
