import { apiFetch } from '@/lib/api-client';
import type { ReviewerScore, SupervisorScore } from '@/types/sprint5';

export async function createSupervisorScore(payload: { defenseRegistrationId: string; score: number; comment?: string }) {
  return apiFetch<SupervisorScore>('/api/scores/supervisor', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createReviewerScore(payload: { reviewerAssignmentId: string; score: number; comment?: string }) {
  return apiFetch<ReviewerScore>('/api/scores/reviewer', { method: 'POST', body: JSON.stringify(payload) });
}
