import type { FileDocument } from './sprint4';
import type { SupervisorAssignment } from './sprint3';

export type DefenseRegistrationStatus =
  | 'SUBMITTED'
  | 'NEEDS_REVISION'
  | 'APPROVED_BY_SUPERVISOR'
  | 'REJECTED_BY_SUPERVISOR'
  | 'SENT_TO_REVIEWER'
  | 'REVIEWER_NEEDS_REVISION'
  | 'APPROVED_BY_REVIEWER'
  | 'READY_FOR_COUNCIL';

export type ReviewerAssignmentStatus = 'ASSIGNED' | 'CANCELLED' | 'COMPLETED';
export type ReviewerEligibilityStatus = 'ELIGIBLE_FOR_DEFENSE' | 'NOT_ELIGIBLE_FOR_DEFENSE';

export type DefenseRegistration = {
  id: string;
  title: string;
  summary?: string | null;
  studentNote?: string | null;
  status: DefenseRegistrationStatus;
  supervisorFeedback?: string | null;
  submittedAt: string;
  student: SupervisorAssignment['student'];
  supervisor: SupervisorAssignment['supervisor'];
  topicRegistration?: { topic?: { title: string } | null } | null;
  reportFile?: FileDocument | null;
  slideFile?: FileDocument | null;
  additionalDocumentFile?: FileDocument | null;
  supervisorScore?: SupervisorScore | null;
  reviewerAssignment?: ReviewerAssignment | null;
};

export type SupervisorScore = {
  id: string;
  score: number;
  comment?: string | null;
};

export type ReviewerAssignment = {
  id: string;
  status: ReviewerAssignmentStatus;
  assignedAt: string;
  student: SupervisorAssignment['student'];
  supervisor: SupervisorAssignment['supervisor'];
  reviewer: SupervisorAssignment['supervisor'];
  defenseRegistration: DefenseRegistration;
  evaluation?: ReviewerEvaluation | null;
  reviewerScore?: ReviewerScore | null;
};

export type ReviewerEvaluation = {
  id: string;
  comment: string;
  strengths?: string | null;
  weaknesses?: string | null;
  questionSuggestions?: string | null;
  eligibilityStatus: ReviewerEligibilityStatus;
  feedbackToStudent?: string | null;
};

export type ReviewerScore = {
  id: string;
  score: number;
  comment?: string | null;
};
