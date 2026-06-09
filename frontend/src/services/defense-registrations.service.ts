import { apiFetch } from '@/lib/api-client';
import type { DefenseRegistration } from '@/types/sprint5';
import type { DefenseRegistrationValues, SupervisorApproveDefenseValues, SupervisorRejectDefenseValues } from '@/schemas/sprint5.schema';

export async function getMyDefenseRegistration() {
  return apiFetch<DefenseRegistration | null>('/api/defense-registrations/me');
}

export async function getSupervisorDefenseRegistrations() {
  return apiFetch<DefenseRegistration[]>('/api/defense-registrations/supervisor');
}

export async function getFacultyDefenseRegistrations() {
  return apiFetch<DefenseRegistration[]>('/api/defense-registrations/faculty');
}

export async function createDefenseRegistration(payload: DefenseRegistrationValues) {
  return apiFetch<DefenseRegistration>('/api/defense-registrations', { method: 'POST', body: JSON.stringify(payload) });
}

export async function resubmitDefenseRegistration(id: string, payload: DefenseRegistrationValues) {
  return apiFetch<DefenseRegistration>(`/api/defense-registrations/${id}/resubmit`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function approveDefenseRegistration(id: string, payload: SupervisorApproveDefenseValues) {
  return apiFetch<DefenseRegistration>(`/api/defense-registrations/${id}/supervisor/approve`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function rejectDefenseRegistration(id: string, payload: SupervisorRejectDefenseValues) {
  return apiFetch<DefenseRegistration>(`/api/defense-registrations/${id}/supervisor/reject`, { method: 'PATCH', body: JSON.stringify(payload) });
}
