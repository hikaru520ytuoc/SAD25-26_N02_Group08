import { apiFetch } from '@/lib/api-client';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

export type RegisterExistingTopicInput = {
  topicId: string;
  projectPeriodId: string;
};

export type ProposeNewTopicInput = {
  projectPeriodId: string;
  proposedTitle: string;
  proposedDescription: string;
  proposedObjectives?: string;
  proposedExpectedOutput?: string;
  proposedMajor?: string;
  requestedSupervisorId?: string;
};

export function getMyTopicRegistrations() {
  return apiFetch<TopicRegistration[]>('/api/topic-registrations/me');
}

export function getAllTopicRegistrations() {
  return apiFetch<TopicRegistration[]>('/api/topic-registrations');
}

export function getFacultyPendingRegistrations() {
  return apiFetch<TopicRegistration[]>('/api/topic-registrations/faculty/pending');
}

export function getSupervisorPendingRequests() {
  return apiFetch<TopicRegistration[]>('/api/topic-registrations/supervisor/pending');
}

export function listSupervisorOptions() {
  return apiFetch<LecturerOption[]>('/api/topic-registrations/supervisors');
}

export function registerExistingTopic(input: RegisterExistingTopicInput) {
  return apiFetch<TopicRegistration>('/api/topic-registrations/register-existing', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function proposeNewTopic(input: ProposeNewTopicInput) {
  const payload = {
    ...input,
    requestedSupervisorId: input.requestedSupervisorId || undefined,
  };
  return apiFetch<TopicRegistration>('/api/topic-registrations/propose-new', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelTopicRegistration(id: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/cancel`, { method: 'PATCH' });
}

export function supervisorAcceptRegistration(id: string, supervisorResponseNote?: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/supervisor/accept`, {
    method: 'PATCH',
    body: JSON.stringify({ supervisorResponseNote }),
  });
}

export function supervisorRejectRegistration(id: string, supervisorResponseNote: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/supervisor/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ supervisorResponseNote }),
  });
}

export function facultyAssignSupervisor(id: string, supervisorId: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/faculty/assign-supervisor`, {
    method: 'PATCH',
    body: JSON.stringify({ supervisorId }),
  });
}

export function facultyConfirmRegistration(id: string, facultyNote?: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/faculty/confirm`, {
    method: 'PATCH',
    body: JSON.stringify({ facultyNote }),
  });
}

export function facultyRejectRegistration(id: string, rejectedReason: string) {
  return apiFetch<TopicRegistration>(`/api/topic-registrations/${id}/faculty/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectedReason }),
  });
}
