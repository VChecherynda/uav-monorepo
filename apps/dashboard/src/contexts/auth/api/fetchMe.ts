import { MeSchema, type Me } from '@uav/shared';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchMe(): Promise<Me> {
  const data = await apiFetch<unknown>('/auth/me');
  return MeSchema.parse(data);
}
