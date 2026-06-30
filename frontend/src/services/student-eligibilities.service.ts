import { apiFetch } from '@/lib/api-client';
import type { AcademicStatus, EligibilityStatus, InternshipStatus, StudentEligibility } from '@/types/sprint2';

export type CreateStudentEligibilityInput = {
  studentId: string;
  projectPeriodId: string;
  internshipStatus: InternshipStatus;
  academicStatus?: AcademicStatus;
  completedCredits?: number;
  requiredCredits?: number;
  gpa?: number;
  hasPrerequisiteDebt?: boolean;
  hasTuitionDebt?: boolean;
  hasDisciplinaryAction?: boolean;
  eligibilityStatus?: EligibilityStatus;
  reason?: string;
};

export function getStudentEligibilities(projectPeriodId?: string) {
  const query = projectPeriodId ? `?projectPeriodId=${projectPeriodId}` : '';
  return apiFetch<StudentEligibility[]>(`/api/student-eligibilities${query}`);
}

export function getMyEligibilities() {
  return apiFetch<StudentEligibility[]>('/api/student-eligibilities/me');
}

export function createStudentEligibility(input: CreateStudentEligibilityInput) {
  return apiFetch<StudentEligibility>('/api/student-eligibilities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
