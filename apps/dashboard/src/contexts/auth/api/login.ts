import { z } from "zod";

import { UserSchema } from "@uav/shared";
import { apiFetch } from "@/lib/apiFetch";

const AuthSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

type Auth = z.infer<typeof AuthSchema>;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Auth> {
  const data = await apiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return AuthSchema.parse(data);
}
