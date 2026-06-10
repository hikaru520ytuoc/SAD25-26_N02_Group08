import { apiFetch } from '@/lib/api-client';
import type { DefenseSession } from '@/types/sprint7';
import type { DefenseSessionValues } from '@/schemas/sprint7.schema';

export function getDefenseSession(scheduleId: string) {
  return apiFetch<DefenseSession | null>(`/api/defense-sessions/${scheduleId}`);
}

export function saveDefenseSession(values: DefenseSessionValues) {
  return apiFetch<DefenseSession>('/api/defense-sessions', { method: 'POST', body: JSON.stringify(values) });
}
