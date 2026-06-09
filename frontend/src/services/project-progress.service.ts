import { apiFetch } from '@/lib/api-client';
import type { ProjectProgress, ProjectProgressComment } from '@/types/sprint4';
import type { ProgressCommentValues, ProgressFormValues } from '@/schemas/sprint4.schema';

export async function getMyProgress() {
  return apiFetch<ProjectProgress[]>('/api/project-progress/me');
}

export async function getSupervisorProgress() {
  return apiFetch<ProjectProgress[]>('/api/project-progress/supervisor');
}

export async function createProgress(payload: ProgressFormValues) {
  return apiFetch<ProjectProgress>('/api/project-progress', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateProgress(id: string, payload: Partial<ProgressFormValues>) {
  return apiFetch<ProjectProgress>(`/api/project-progress/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function addProgressComment(id: string, payload: ProgressCommentValues) {
  return apiFetch<ProjectProgressComment>(`/api/project-progress/${id}/comments`, { method: 'POST', body: JSON.stringify(payload) });
}
