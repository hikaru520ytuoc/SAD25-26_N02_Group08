export function isCouncilScoreLocked(sessionStatus?: string | null) {
  return sessionStatus === 'COMPLETED';
}
