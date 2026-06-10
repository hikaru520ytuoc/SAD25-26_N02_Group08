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
};
