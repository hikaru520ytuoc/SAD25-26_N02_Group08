import { apiFetch } from '@/lib/api-client';
import type { SupervisorAssignment } from '@/types/sprint3';

function normalizeAssignments(payload: unknown): SupervisorAssignment[] {
  if (Array.isArray(payload)) return payload as SupervisorAssignment[];

  if (payload && typeof payload === 'object') {
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) return candidate.items as SupervisorAssignment[];
    if (Array.isArray(candidate.data)) return candidate.data as SupervisorAssignment[];
  }

  return [];
}

async function fetchAssignments(path: string) {
  return normalizeAssignments(await apiFetch<unknown>(path));
}

export function getSupervisorAssignments() {
  return fetchAssignments('/api/supervisor-assignments');
}

export function getMyStudents() {
  return fetchAssignments('/api/supervisor-assignments/my-students');
}

export function getMySupervisorAssignment() {
  return fetchAssignments('/api/supervisor-assignments/me');
}
