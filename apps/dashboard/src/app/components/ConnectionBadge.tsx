import React from "react";

import { WSConnectionStatus } from "@/lib/api";

export const ConnectionBadge = ({ status }: { status: WSConnectionStatus }) => {
  return <div> {status === "open" ? "🟢 Live" : "🔴 Reconnecting"}</div>;
};
