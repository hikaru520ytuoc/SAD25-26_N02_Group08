import { apiFetch } from '@/lib/api-client';
import type { SupervisorAssignment } from '@/types/sprint3';

export function getSupervisorAssignments() {
  return apiFetch<SupervisorAssignment[]>('/api/supervisor-assignments');
}

export function getMyStudents() {
  return apiFetch<SupervisorAssignment[]>('/api/supervisor-assignments/my-students');
}

export function getMySupervisorAssignment() {
  return apiFetch<SupervisorAssignment[]>('/api/supervisor-assignments/me');
}
