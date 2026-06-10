import { apiFetch } from '@/lib/api-client';
import type { CouncilScore, ScoreSummary } from '@/types/sprint7';
import type { CouncilScoreValues } from '@/schemas/sprint7.schema';

export function getCouncilScores(defenseScheduleId: string) {
  return apiFetch<CouncilScore[]>(`/api/scores/council/${defenseScheduleId}`);
}

export function saveCouncilScore(values: CouncilScoreValues) {
  return apiFetch<CouncilScore>('/api/scores/council', { method: 'POST', body: JSON.stringify(values) });
}

export function calculateScore(defenseRegistrationId: string) {
  return apiFetch<ScoreSummary>(`/api/scores/calculate/${defenseRegistrationId}`, { method: 'POST', body: JSON.stringify({}) });
}

export function getScoreSummary(defenseRegistrationId: string) {
  return apiFetch<ScoreSummary>(`/api/scores/summary/${defenseRegistrationId}`);
}
