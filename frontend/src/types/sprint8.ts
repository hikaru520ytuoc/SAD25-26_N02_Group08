import type { FileDocument } from './sprint4';
export type RevisionRequest = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING_SUBMISSION' | 'SUBMITTED' | 'NEEDS_CHANGES' | 'APPROVED' | 'CANCELLED';
  feedback?: string | null;
  dueDate?: string | null;
  finalResult?: any;
  student?: any;
  submissions?: RevisionSubmission[];
};

export type RevisionSubmission = {
  id: string;
  versionNumber: number;
  note?: string | null;
  reportFileId?: string | null;
  reportFile?: FileDocument | null;
  status?: 'SUBMITTED' | 'APPROVED' | 'NEEDS_CHANGES';
  submittedAt: string;
};

export type ArchiveRecord = {
  id: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'NEEDS_SUPPLEMENT' | 'APPROVED' | 'COMPLETED' | 'LOCKED';
  archiveNote?: string | null;
  supplementReason?: string | null;
  finalResult?: any;
  student?: any;
  revisionRequest?: RevisionRequest | null;
  finalReportFileId?: string | null;
  finalSlideFileId?: string | null;
  sourceCodeFileId?: string | null;
  additionalDocumentFileId?: string | null;
  lockedAt?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  finalReportFile?: FileDocument | null;
  finalSlideFile?: FileDocument | null;
  sourceCodeFile?: FileDocument | null;
  additionalDocumentFile?: FileDocument | null;
};
