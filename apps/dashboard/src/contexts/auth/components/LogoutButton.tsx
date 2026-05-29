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
      <div className="avatar-initials">{initials}</div>
      <span className="font-mono text-xs text-muted">{user?.email}</span>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="btn-logout px-3 py-1 text-xs rounded border"
      >
        LOGOUT
      </button>
    </div>
  );
}
