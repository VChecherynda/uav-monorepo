import { useEffect } from 'react';
import { useRole } from '../hooks/useRole';
import { useRouter } from 'next/navigation';

export function RequireCommander({ children }: { children: React.ReactNode }) {
  const { isLoading, isCommander } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isCommander) {
      router.replace('/');
    }
  }, [isLoading, isCommander, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  if (!isCommander) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
