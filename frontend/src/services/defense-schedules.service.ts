import { apiFetch } from '@/lib/api-client';
import type { DefenseScheduleValues } from '@/schemas/sprint6.schema';
import type { DefenseSchedule } from '@/types/sprint6';

export function getDefenseSchedules() {
  return apiFetch<DefenseSchedule[]>('/api/defense-schedules');
}

export function getMyDefenseSchedules() {
  return apiFetch<DefenseSchedule[]>('/api/defense-schedules/me');
}

export function getCouncilDefenseSchedules() {
  return apiFetch<DefenseSchedule[]>('/api/defense-schedules/council');
}

export function createDefenseSchedule(payload: DefenseScheduleValues) {
  const body = {
    ...payload,
    startTime: new Date(`${payload.defenseDate}T${payload.startTime}`).toISOString(),
    endTime: new Date(`${payload.defenseDate}T${payload.endTime}`).toISOString(),
  };
  return apiFetch<DefenseSchedule>('/api/defense-schedules', { method: 'POST', body: JSON.stringify(body) });
}
