import type { NotificationItem, SupervisorAssignment } from './sprint3';

export type OutlineStatus = 'SUBMITTED' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED';
export type ProjectProgressStatus = 'SUBMITTED' | 'REVIEWED';
export type FileDocumentType = 'OUTLINE' | 'PROGRESS_DRAFT' | 'REPORT' | 'SLIDE' | 'DEFENSE_DOCUMENT' | 'DEFENSE_REPORT_FINAL' | 'DEFENSE_SLIDE_FINAL' | 'DEFENSE_SUPPLEMENT' | 'DEFENSE_OTHER_DOCUMENT' | 'REVISION_REPORT' | 'FINAL_REPORT' | 'FINAL_SLIDE' | 'SOURCE_CODE' | 'ARCHIVE_DOCUMENT' | 'ARCHIVE_SUPPLEMENT' | 'ARCHIVE_OTHER' | 'REVISION' | 'ARCHIVE' | 'OTHER';

export type FileDocument = {
  id: string;
  ownerId: string;
  originalName: string;
  storedName: string;
  bucket: string;
  objectKey: string;
  mimeType: string;
  size: number;
  fileType: FileDocumentType;
  relatedType?: string | null;
  relatedId?: string | null;
  uploadedById: string;
  createdAt: string;
  deletedAt?: string | null;
};

export type OutlineVersion = {
  id: string;
  versionNumber: number;
  title: string;
  summary: string;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  timeline?: string | null;
  fileDocument?: FileDocument | null;
  submitNote?: string | null;
  submittedAt: string;
  createdAt: string;
};

export type Outline = {
  id: string;
  title: string;
  summary: string;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  timeline?: string | null;
  status: OutlineStatus;
  currentVersion: number;
  submittedAt: string;
  reviewedAt?: string | null;
  feedback?: string | null;
  student: SupervisorAssignment['student'];
  supervisor: SupervisorAssignment['supervisor'];
  supervisorAssignment: SupervisorAssignment;
  versions: OutlineVersion[];
};

export type ProjectProgressComment = {
  id: string;
  comment: string;
  createdAt: string;
  commenter: { id: string; email: string; fullName: string };
};

export type ProjectProgress = {
  id: string;
  title: string;
  content: string;
  progressPercent?: number | null;
  status: ProjectProgressStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  student: SupervisorAssignment['student'];
  supervisor: SupervisorAssignment['supervisor'];
  supervisorAssignment: SupervisorAssignment;
  fileDocument?: FileDocument | null;
  comments: ProjectProgressComment[];
};

export type { NotificationItem };
