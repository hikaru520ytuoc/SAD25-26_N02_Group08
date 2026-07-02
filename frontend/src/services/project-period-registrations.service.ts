import { apiFetch } from '@/lib/api-client';
import type { StudentAcademicEligibility } from '@/types/auth';
import type { ProjectPeriod } from '@/types/sprint2';

export type ProjectPeriodRegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'COMPLETED';

export type ProjectPeriodRegistration = {
  id: string;
  studentId: string;
  projectPeriodId: string;
  status: ProjectPeriodRegistrationStatus;
  registeredAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  projectPeriod: ProjectPeriod;
};

export type AvailableProjectPeriodsResult = {
  eligibility: StudentAcademicEligibility;
  activeRegistration?: ProjectPeriodRegistration | null;
  periods: ProjectPeriod[];
};

export function getAvailableProjectPeriods() {
  return apiFetch<AvailableProjectPeriodsResult>('/api/project-period-registrations/available');
}

export function getMyProjectPeriodRegistrations() {
  return apiFetch<ProjectPeriodRegistration[]>('/api/project-period-registrations/me');
}

export function registerProjectPeriod(projectPeriodId: string) {
  return apiFetch<ProjectPeriodRegistration>('/api/project-period-registrations', {
    method: 'POST',
    body: JSON.stringify({ projectPeriodId }),
  });
}

export function cancelProjectPeriodRegistration(id: string) {
  return apiFetch<ProjectPeriodRegistration>(`/api/project-period-registrations/${id}/cancel`, {
    method: 'PATCH',
  });
}
