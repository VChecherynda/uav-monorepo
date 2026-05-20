import type { User } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

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
