import { apiFetch } from '@/lib/api-client';
import type { RevisionRequest, RevisionSubmission } from '@/types/sprint8';
import type { RequestRevisionChangesValues, RevisionSubmissionValues } from '@/schemas/sprint8.schema';

export function getMyRevisions() { return apiFetch<RevisionRequest[]>('/api/revisions/me'); }
export function getRevisions() { return apiFetch<RevisionRequest[]>('/api/revisions'); }
export function submitRevision(id: string, values: RevisionSubmissionValues) { return apiFetch<RevisionSubmission>(`/api/revisions/${id}/submissions`, { method: 'POST', body: JSON.stringify(values) }); }
export function approveRevision(id: string) { return apiFetch<RevisionRequest>(`/api/revisions/${id}/approve`, { method: 'PATCH', body: JSON.stringify({}) }); }
export function requestRevisionChanges(id: string, values: RequestRevisionChangesValues) { return apiFetch<RevisionRequest>(`/api/revisions/${id}/request-changes`, { method: 'PATCH', body: JSON.stringify(values) }); }
