import { useEffect } from 'react';
import { useMe } from '../hooks/useMe';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function RequireCommander({ children }: { children: React.ReactNode }) {
  const { isLoading, data } = useMe();
  const router = useRouter();

  const isCommander = data?.unitRole === 'COMMANDER';

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
