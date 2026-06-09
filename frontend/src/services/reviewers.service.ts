import { apiFetch } from '@/lib/api-client';
import type { ReviewerAssignment } from '@/types/sprint5';
import type { ReviewerAssignmentValues, ReviewerEvaluationValues } from '@/schemas/sprint5.schema';

export async function getReviewerAssignments() {
  return apiFetch<ReviewerAssignment[]>('/api/reviewers/assignments');
}

export async function getMyReviewerAssignments() {
  return apiFetch<ReviewerAssignment[]>('/api/reviewers/assignments/me');
}

export async function createReviewerAssignment(payload: ReviewerAssignmentValues) {
  return apiFetch<ReviewerAssignment>('/api/reviewers/assignments', { method: 'POST', body: JSON.stringify(payload) });
}

export async function submitReviewerEvaluation(payload: ReviewerEvaluationValues) {
  return apiFetch<ReviewerAssignment>('/api/reviewers/evaluations', { method: 'POST', body: JSON.stringify(payload) });
}
