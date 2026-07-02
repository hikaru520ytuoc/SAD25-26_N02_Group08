import { apiFetch } from '@/lib/api-client';
import type { Major, StudentAcademicEligibility } from '@/types/auth';
import type { ProjectPeriod } from '@/types/sprint2';

export type AcademicEligibilityOverviewItem = {
  id: string;
  studentCode: string;
  className: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    status: 'ACTIVE' | 'LOCKED';
  };
  major: Major;
  faculty?: { id: string; code: string; name: string } | null;
  internshipStatus: 'NOT_COMPLETED' | 'COMPLETED' | 'WAIVED';
  academicStatus: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
  accumulatedCredits: number;
  gpa: number;
  hasPrerequisiteDebt: boolean;
  hasTuitionDebt: boolean;
  hasDisciplinaryAction: boolean;
  eligibility: StudentAcademicEligibility;
  activeProjectPeriodRegistration?: {
    id: string;
    status: 'REGISTERED' | 'CANCELLED' | 'COMPLETED';
    registeredAt: string;
    projectPeriod: ProjectPeriod;
  } | null;
  updatedAt: string;
};

export function getAcademicEligibilityOverview(params?: {
  search?: string;
  majorCode?: string;
  eligible?: boolean;
}) {
  const search = new URLSearchParams();
  if (params?.search) search.set('search', params.search);
  if (params?.majorCode) search.set('majorCode', params.majorCode);
  if (params?.eligible !== undefined) search.set('eligible', String(params.eligible));
  const query = search.toString();
  return apiFetch<AcademicEligibilityOverviewItem[]>(`/api/students/academic-eligibility${query ? `?${query}` : ''}`);
}

export function getMyAcademicEligibility() {
  return apiFetch<AcademicEligibilityOverviewItem>('/api/students/me/academic-eligibility');
}
