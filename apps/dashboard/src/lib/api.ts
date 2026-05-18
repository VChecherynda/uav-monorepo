import type { User, Drone, Telemetry, WSConnectionStatus } from "@uav/shared";
export type { Drone, WSConnectionStatus };
import { useAuthStore } from "@/stores/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }

    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? `HTTP status: ${response.status}`);
  }

  return response.json();
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return apiFetch<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchTelemetry(droneId: string): Promise<Telemetry[]> {
  return apiFetch<Telemetry[]>(`/drones/${droneId}/telemetry`);
}

export async function fetchDrone(id: string): Promise<Drone[]> {
  return apiFetch<Drone[]>(`/drones/${id}`);
}

export async function sendCommand(id: string, action: string) {
  return apiFetch<{ ok: boolean }>(`/drones/${id}/command`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
