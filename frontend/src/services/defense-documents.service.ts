import { apiFetch } from '@/lib/api-client';
import type { DefenseDocumentValues, RequestSupplementValues } from '@/schemas/sprint6.schema';
import type { DefenseDocument } from '@/types/sprint6';

export function getMyDefenseDocuments() {
  return apiFetch<DefenseDocument[]>('/api/defense-documents/me');
}

export function getSecretaryDefenseDocuments() {
  return apiFetch<DefenseDocument[]>('/api/defense-documents/secretary');
}

export function submitDefenseDocument(scheduleId: string, payload: DefenseDocumentValues) {
  return apiFetch<DefenseDocument>(`/api/defense-documents/${scheduleId}/submit`, { method: 'POST', body: JSON.stringify(payload) });
}

export function resubmitDefenseDocument(id: string, payload: DefenseDocumentValues) {
  return apiFetch<DefenseDocument>(`/api/defense-documents/${id}/resubmit`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function requestDefenseDocumentSupplement(id: string, payload: RequestSupplementValues) {
  return apiFetch<DefenseDocument>(`/api/defense-documents/${id}/request-supplement`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function approveDefenseDocument(id: string) {
  return apiFetch<DefenseDocument>(`/api/defense-documents/${id}/approve`, { method: 'PATCH' });
}
