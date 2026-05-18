import React from "react";

import { WSConnectionStatus } from "@/lib/api";

const COLORS: Record<WSConnectionStatus, string> = {
  connecting: "⏳ Connecting...",
  open: "🟢 Live",
  reconnecting: "🟡 Reconnecting...",
  lost: "🔴 Disconnected",
};

export const ConnectionBadge = ({ status }: { status: WSConnectionStatus }) => {
  return <div>{COLORS[status]}</div>;
};
