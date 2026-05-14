import type { Drone, WSConnectionStatus } from "@uav/shared";
export type { Drone, WSConnectionStatus };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchDrones(): Promise<Drone[]> {
  const res = await fetch(`${API}/drones`);
  if (!res.ok) throw new Error("Failed to fetch drones");
  return res.json();
}

export async function fetchDrone(id: string): Promise<Drone[]> {
  const res = await fetch(`${API}/drone/${id}`);
  if (!res.ok) throw new Error("Failed to fetch drone");
  return res.json();
}

export async function sendCommand(id: string, action: string) {
  const res = await fetch(`${API}/drones/${id}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`Command failed: ${res.status}`);
  return res.json();
}
