import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/contexts/auth/stores/useAuthStore';
import { fetchMe } from '@/contexts/auth/api/fetchMe';

const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

export const useMe = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['me', user?.id],
    queryFn: fetchMe,
    refetchInterval: REFETCH_INTERVAL_MS,
    enabled: !!token,
  });
};
