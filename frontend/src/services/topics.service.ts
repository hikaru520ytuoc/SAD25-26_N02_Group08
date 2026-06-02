import { apiFetch } from '@/lib/api-client';
import type { Topic, TopicStatus } from '@/types/sprint2';

export type TopicInput = {
  title: string;
  description: string;
  objectives?: string;
  expectedOutput?: string;
  major?: string;
  maxStudents: number;
  projectPeriodId: string;
};

export function getTopics(status?: TopicStatus) {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Topic[]>(`/api/topics${query}`);
}

export function getPublishedTopics() {
  return apiFetch<Topic[]>('/api/topics/published');
}

export function getMyTopics() {
  return apiFetch<Topic[]>('/api/topics/my');
}

export function createTopic(input: TopicInput) {
  return apiFetch<Topic>('/api/topics', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitTopic(id: string) {
  return apiFetch<Topic>(`/api/topics/${id}/submit`, { method: 'PATCH' });
}

export function approveTopic(id: string) {
  return apiFetch<Topic>(`/api/topics/${id}/approve`, { method: 'PATCH' });
}

export function rejectTopic(id: string, rejectionReason: string) {
  return apiFetch<Topic>(`/api/topics/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectionReason }),
  });
}

export function publishTopic(id: string) {
  return apiFetch<Topic>(`/api/topics/${id}/publish`, { method: 'PATCH' });
}
