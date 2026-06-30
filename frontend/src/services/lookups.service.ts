import { apiFetch } from '@/lib/api-client';

export type LookupOption = {
  id: string;
  label: string;
  subLabel?: string | null;
  code?: string | null;
  status?: string | null;
  disabled?: boolean;
  disabledReason?: string | null;
  meta?: Record<string, unknown>;
};

function toQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export function getLookupProjectPeriods(params?: { status?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/project-periods${toQuery(params)}`);
}

export function getLookupStudents(params?: { search?: string; projectPeriodId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/students${toQuery(params)}`);
}

export function getLookupLecturers(params?: { role?: string; search?: string; excludeLecturerId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/lecturers${toQuery(params)}`);
}

export function getLookupSupervisors(params?: { search?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/supervisors${toQuery(params)}`);
}

export function getLookupReviewers(params?: { search?: string; excludeLecturerId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/reviewers${toQuery(params)}`);
}

export function getLookupTopics(params?: { status?: string; projectPeriodId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/topics${toQuery(params)}`);
}

export function getLookupCouncils(params?: { status?: string; projectPeriodId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/councils${toQuery(params)}`);
}

export function getLookupDefenseRegistrations(params?: { status?: string; projectPeriodId?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/defense-registrations${toQuery(params)}`);
}

export function getLookupDefenseSchedules(params?: { councilId?: string; studentId?: string; status?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/defense-schedules${toQuery(params)}`);
}

export function getLookupFinalResults(params?: { resultStatus?: string; publicationStatus?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/final-results${toQuery(params)}`);
}

export function getLookupArchiveRecords(params?: { status?: string }) {
  return apiFetch<LookupOption[]>(`/api/lookups/archive-records${toQuery(params)}`);
}

export function getLookupRoles() {
  return apiFetch<LookupOption[]>('/api/lookups/roles');
}

export function getLookupFaculties() {
  return apiFetch<LookupOption[]>('/api/lookups/faculties');
}
