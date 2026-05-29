"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAuthStore } from "@/contexts/auth";
import { CrosshairIcon } from "@/components/icons/CrosshairIcon";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login({ email, password });
      setAuth(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-grid flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Brand mark */}

        <div className="flex flex-col items-center gap-2 text-center">
          <CrosshairIcon size={32} />
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-semibold tracking-[0.25em] text-primary">
              UAV FLEET
            </span>
            <span className="label tracking-[0.15em]">
              Fleet Command // Operational
            </span>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          style={{ borderLeft: "3px solid var(--accent-warn)" }}
          className="flex flex-col gap-4 bg-surface border border-subtle rounded-lg px-6 py-6"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-tactical"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input-tactical"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </form>

        {/* Demo credentials */}
        <p className="font-mono text-muted text-center text-xs">
          demo access - <span className="text-secondary"> demo@uav.test</span>
        </p>
      </div>
    </div>
  );
}
