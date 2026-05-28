"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAuthStore } from "@/contexts/auth";

function CrosshairIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--accent-info)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="14"
        cy="14"
        r="4"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="8"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="20"
        x2="14"
        y2="26"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="2"
        y1="14"
        x2="8"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="14"
        x2="26"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

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
          <CrosshairIcon />
          <div className="flex flex-col gap-1">
            <span
              className="text-sm font-semibold tracking-[0.25em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
              }}
            >
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

          {error && (
            <p
              className="rounded px-3 py-2 text-xs border"
              style={{
                background: "var(--glow-critical)",
                borderColor: "var(--accent-critical)",
                color: "var(--accent-critical)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded px-4 py-2 text-sm font-semibold tracking-widest transition-colors disabled:opacity-40"
            style={{
              background: "var(--accent-warn)",
              color: "var(--bg-deep)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {isLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </form>

        {/* Demo credentials */}
        <p
          className="text-center text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
        >
          demo access -{" "}
          <span style={{ color: "var(--text-secondary)" }}> demo@uav.test</span>
        </p>
      </div>
    </div>
  );
}
