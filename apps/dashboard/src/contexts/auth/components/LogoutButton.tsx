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

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">{user?.email}</span>
      <button
        onClick={handleLogout}
        className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
      >
        Logout
      </button>
    </div>
  );
}
