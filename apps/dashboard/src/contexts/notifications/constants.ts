export const TOAST_DURATION = {
  info: 4000,
  warn: 7000,
  critical: null,
} as const;

export const TOAST_COLORS = {
  info: {
    border: "var(--accent-info)",
    glow: "none",
  },
  warn: {
    border: "var(--accent-warn)",
    glow: "var(--glow-warn)",
  },
  critical: {
    border: "var(--accent-critical)",
    glow: "var(--glow-critical)",
  },
} as const;

export const TOAST_LABELS = {
  BatteryCritical: "BATTERY CRITICAL",
  DroneCommandRejected: "COMMAND REJECTED",
  DroneRecovered: "DRONE RECOVERED",
} as const;
