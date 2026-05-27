import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTelemetry } from "@/contexts/telemetry/hooks/useTelemetry";
  
export const BatteryChart = ({ droneId }: { droneId: string | null }) => {
  const { data = [] } = useTelemetry(droneId);

  const sorted = [...data].reverse();

  if (!droneId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Select a drone to view battery history
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={sorted}>
        <XAxis dataKey="recordedAt" hide />
        <YAxis domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "6px",
            color: "#f8fafc",
          }}
          itemStyle={{ color: "#22d3ee" }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Line type="monotone" dataKey="battery" stroke="white" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
