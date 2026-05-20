import { useAuthStore } from "@/contexts/auth";

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
