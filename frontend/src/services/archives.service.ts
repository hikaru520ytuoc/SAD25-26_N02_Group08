import { apiFetch } from '@/lib/api-client';
import type { ArchiveRecord } from '@/types/sprint8';
import type { ArchiveSubmissionValues, ArchiveSupplementValues } from '@/schemas/sprint8.schema';

export function getMyArchives() { return apiFetch<ArchiveRecord[]>('/api/archives/me'); }
export function getArchives() { return apiFetch<ArchiveRecord[]>('/api/archives'); }
export function submitArchive(values: ArchiveSubmissionValues) { return apiFetch<ArchiveRecord>('/api/archives', { method: 'POST', body: JSON.stringify(values) }); }
export function resubmitArchive(id: string, values: ArchiveSubmissionValues) { return apiFetch<ArchiveRecord>(`/api/archives/${id}/resubmit`, { method: 'PATCH', body: JSON.stringify(values) }); }
export function requestArchiveSupplement(id: string, values: ArchiveSupplementValues) { return apiFetch<ArchiveRecord>(`/api/archives/${id}/request-supplement`, { method: 'PATCH', body: JSON.stringify(values) }); }
export function approveArchive(id: string) { return apiFetch<ArchiveRecord>(`/api/archives/${id}/approve`, { method: 'PATCH', body: JSON.stringify({}) }); }
export function completeArchive(id: string) { return apiFetch<ArchiveRecord>(`/api/archives/${id}/complete`, { method: 'PATCH', body: JSON.stringify({}) }); }
export function lockArchive(id: string) { return apiFetch<ArchiveRecord>(`/api/archives/${id}/lock`, { method: 'PATCH', body: JSON.stringify({}) }); }
