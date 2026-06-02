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

export function getProjectPeriods() {
  return apiFetch<ProjectPeriod[]>('/api/project-periods');
}

export function createProjectPeriod(input: ProjectPeriodInput) {
  return apiFetch<ProjectPeriod>('/api/project-periods', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function openProjectPeriod(id: string) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}/open`, { method: 'PATCH' });
}

export function closeProjectPeriod(id: string) {
  return apiFetch<ProjectPeriod>(`/api/project-periods/${id}/close`, { method: 'PATCH' });
}
