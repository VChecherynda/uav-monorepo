"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/auth/stores/useAuthStore";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = user?.email?.slice(0, 2).toLocaleUpperCase() ?? "??";

  return (
    <div className="flex items-center gap-3">
      {/* User identity block */}
      <div
        className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-strong)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {initials}
      </div>
      <span
        className="text-xs"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
      >
        {user?.email}
      </span>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="px-3 py-1 text-xs rounded border btn-logout"
      >
        LOGOUT
      </button>
    </div>
  );
}
