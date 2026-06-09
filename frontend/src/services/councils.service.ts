import { apiFetch } from '@/lib/api-client';
import type { CouncilMemberValues, CouncilValues } from '@/schemas/sprint6.schema';
import type { DefenseCouncil } from '@/types/sprint6';

export function getCouncils() {
  return apiFetch<DefenseCouncil[]>('/api/councils');
}

export function createCouncil(payload: CouncilValues) {
  return apiFetch<DefenseCouncil>('/api/councils', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateCouncil(id: string, payload: Partial<CouncilValues>) {
  return apiFetch<DefenseCouncil>(`/api/councils/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function addCouncilMember(councilId: string, payload: CouncilMemberValues) {
  return apiFetch(`/api/councils/${councilId}/members`, { method: 'POST', body: JSON.stringify(payload) });
}
