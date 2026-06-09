import { apiFetch } from '@/lib/api-client';
import type { Outline } from '@/types/sprint4';
import type { OutlineFormValues, RequestRevisionValues } from '@/schemas/sprint4.schema';

export async function getMyOutline() {
  return apiFetch<Outline | null>('/api/outlines/me');
}

export async function getSupervisorOutlines(status?: string) {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Outline[]>(`/api/outlines/supervisor${query}`);
}

export async function createOutline(payload: OutlineFormValues) {
  return apiFetch<Outline>('/api/outlines', { method: 'POST', body: JSON.stringify(payload) });
}

export async function resubmitOutline(id: string, payload: OutlineFormValues) {
  return apiFetch<Outline>(`/api/outlines/${id}/resubmit`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function approveOutline(id: string) {
  return apiFetch<Outline>(`/api/outlines/${id}/approve`, { method: 'PATCH' });
}

export async function requestOutlineRevision(id: string, payload: RequestRevisionValues) {
  return apiFetch<Outline>(`/api/outlines/${id}/request-revision`, { method: 'PATCH', body: JSON.stringify(payload) });
}
