import { apiFetch } from '@/lib/api-client';
import type { FinalResult } from '@/types/sprint7';
import type { ConfirmResultValues } from '@/schemas/sprint7.schema';

export function getResults() {
  return apiFetch<FinalResult[]>('/api/results');
}

export function getPendingResults() {
  return apiFetch<FinalResult[]>('/api/results/pending-publication');
}

export function getMyResult() {
  return apiFetch<FinalResult>('/api/results/me');
}

export function generateResult(defenseRegistrationId: string) {
  return apiFetch<FinalResult>(`/api/results/generate/${defenseRegistrationId}`, { method: 'POST', body: JSON.stringify({}) });
}

export function confirmResult(id: string, values: ConfirmResultValues) {
  return apiFetch<FinalResult>(`/api/results/${id}/confirm`, { method: 'PATCH', body: JSON.stringify(values) });
}

export function publishResult(id: string) {
  return apiFetch<FinalResult>(`/api/results/${id}/publish`, { method: 'PATCH', body: JSON.stringify({}) });
}
