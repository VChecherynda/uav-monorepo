"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
