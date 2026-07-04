import { apiFetch } from '@/lib/api-client';
import type { ProjectPeriod } from '@/types/sprint2';

export type ProjectPeriodInput = {
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
};

export type ProjectPeriodExtensionInput = {
  type: 'REGISTRATION' | 'PERIOD' | 'BOTH';
  endDate?: string;
  registrationEndDate?: string;
  reason: string;
  notifyUsers: boolean;
};

export function getProjectPeriods(params?: { search?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'ALL') query.set('status', params.status);
  return apiFetch<ProjectPeriod[]>(`/api/project-periods${query.size ? `?${query}` : ''}`);
}

export function getProjectPeriod(id: string) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}`);
}

export function getProjectPeriodStudents(id: string) {
  return apiFetch<any[]>(`/api/project-periods/${id}/students`);
}

export function getProjectPeriodTopics(id: string) {
  return apiFetch<any[]>(`/api/project-periods/${id}/topics`);
}

export function createProjectPeriod(input: ProjectPeriodInput) {
  return apiFetch<ProjectPeriod>('/api/project-periods', { method: 'POST', body: JSON.stringify(input) });
}

export function updateProjectPeriod(id: string, input: Partial<ProjectPeriodInput>) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function openProjectPeriod(id: string) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}/open`, { method: 'PATCH' });
}

export function closeProjectPeriod(id: string) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}/close`, { method: 'PATCH' });
}

export function extendProjectPeriod(id: string, input: ProjectPeriodExtensionInput) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}/extend`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteDraftProjectPeriod(id: string) {
  return apiFetch<{ id: string }>(`/api/project-periods/${id}`, { method: 'DELETE' });
}
