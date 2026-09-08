import { z } from "zod";
import { useAuthStore } from "@/contexts/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ResponseError extends ApiError {
  reason: unknown;

  constructor(message: string, reason: unknown) {
    super(message);
    this.reason = reason;
  }
}

export class TransportError extends ApiError {}
export class MalformedResponseError extends ApiError {}

export async function authorizedFetch(path: string, options?: RequestInit) {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }).catch((cause) => {
    throw new TransportError("Could not reach the server", { cause });
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  return response;
}

export async function fetchOutcome<T>(
  path: string,
  scheme: z.ZodType<T>,
  options?: RequestInit,
) {
  const response = await authorizedFetch(path, options);

  try {
    const data = await response.json();
    return scheme.parse(data);
  } catch (cause) {
    throw new MalformedResponseError("Server sent a malformed response", {
      cause,
    });
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await authorizedFetch(path, options);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new ResponseError(
      error.message ?? error.error ?? `HTTP status: ${response.status}`,
      error,
    );
  }

  return response.json().catch((cause) => {
    throw new MalformedResponseError("Server sent a malformed response", {
      cause,
    });
  });
}
