"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTelemetry } from "@/contexts/telemetry";
import { useDronesStore } from "@/contexts/drones";

export const BatteryChart = () => {
  const droneId = useDronesStore((s) => s.droneId);
  const { data = [] } = useTelemetry(droneId);

  const sorted = [...data].reverse();

  if (!droneId) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        SELECT DRONE TO VIEW TELEMETRY
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={sorted}>
        <defs>
          <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--accent-info)"
              stopOpacity={0.2}
            />
            <stop offset="95%" stopColor="var(--accent-info)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-subtle)"
          vertical={false}
        />

        <XAxis dataKey="recordedAt" hide />
        <YAxis
          domain={[0, 100]}
          tick={{
            fill: "var(--text-muted)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
          }}
          tickLine={false}
          axisLine={false}
          width={36}
        />

        <Tooltip
          labelFormatter={(value) =>
            new Date(value).toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          }
          contentStyle={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
          itemStyle={{ color: "var(--accent-info)" }}
          labelStyle={{ color: "var(--text-muted)", fontSize: "10px" }}
        />

        <ReferenceLine
          y={40}
          stroke="var(--accent-warn)"
          strokeDasharray="4 4"
          strokeOpacity={0.6}
        />

        <ReferenceLine
          y={20}
          stroke="var(--accent-critical)"
          strokeDasharray="4 4"
          strokeOpacity={0.6}
        />

        <Area
          type="monotone"
          dataKey="battery"
          stroke="var(--accent-info)"
          strokeWidth={1.5}
          fill="url(#batteryGradient)"
          dot={false}
          activeDot={{
            r: 3,
            fill: "var(--accent-info)",
            stroke: "var(--bg-elevated)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
