import { apiFetch } from '@/lib/api-client';
import type { Role, UserListItem } from '@/types/auth';

export type PaginatedUsers = {
  items: UserListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type CreateUserInput = {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  roleIds?: string[];
  studentProfile?: {
    studentCode?: string;
    className?: string;
    major?: string;
    facultyId?: string;
    projectPeriodId?: string;
    internshipStatus?: 'NOT_COMPLETED' | 'COMPLETED' | 'WAIVED';
    academicStatus?: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
    completedCredits?: number;
    requiredCredits?: number;
    gpa?: number;
    hasPrerequisiteDebt?: boolean;
    hasTuitionDebt?: boolean;
    hasDisciplinaryAction?: boolean;
    reason?: string;
  };
};

export function getUsers() {
  return apiFetch<PaginatedUsers>('/api/users');
}

export function createUser(input: CreateUserInput) {
  return apiFetch<UserListItem>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function lockUser(id: string) {
  return apiFetch<UserListItem>(`/api/users/${id}/lock`, {
    method: 'PATCH',
  });
}

export function unlockUser(id: string) {
  return apiFetch<UserListItem>(`/api/users/${id}/unlock`, {
    method: 'PATCH',
  });
}

export function assignRoles(userId: string, roleIds: string[]) {
  return apiFetch<UserListItem>(`/api/users/${userId}/roles`, {
    method: 'PATCH',
    body: JSON.stringify({ roleIds }),
  });
}

export function getRoles() {
  return apiFetch<Role[]>('/api/roles');
}
