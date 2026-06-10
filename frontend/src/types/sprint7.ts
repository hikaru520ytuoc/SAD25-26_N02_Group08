export type CouncilScore = {
  id: string;
  defenseScheduleId: string;
  councilMemberId: string;
  lecturerId: string;
  score: number;
  comment?: string | null;
  councilMember?: { id: string; roleInCouncil: string; lecturer?: { user?: { fullName: string; email: string } } };
};

export type ScoreSummary = {
  id?: string;
  defenseRegistrationId?: string;
  defenseScheduleId?: string;
  supervisorScore: number | null;
  reviewerScore: number | null;
  councilAverageScore: number | null;
  finalScore: number | null;
};

export type FinalResult = {
  id: string;
  defenseRegistrationId: string;
  defenseScheduleId: string;
  studentId: string;
  supervisorScore: number;
  reviewerScore: number;
  councilAverageScore: number;
  finalScore: number;
  resultStatus: 'PASSED' | 'FAILED' | 'PASSED_WITH_REVISION';
  publicationStatus: 'DRAFT' | 'CONFIRMED' | 'PUBLISHED';
  revisionRequired: boolean;
  revisionNote?: string | null;
  student?: { user?: { fullName: string; email: string }; studentCode?: string };
};

export type DefenseSession = {
  id: string;
  defenseScheduleId: string;
  sessionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  generalComment?: string | null;
  conclusion?: string | null;
  revisionRequired: boolean;
  revisionNote?: string | null;
};
