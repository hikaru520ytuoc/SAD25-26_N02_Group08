-- Sprint 8: post-defense revision, archive records and project record locking.

ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'REVISION_REPORT';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'FINAL_REPORT';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'FINAL_SLIDE';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'SOURCE_CODE';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'ARCHIVE_DOCUMENT';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'ARCHIVE_SUPPLEMENT';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'ARCHIVE_OTHER';

CREATE TYPE "RevisionRequestStatus" AS ENUM ('PENDING_SUBMISSION', 'SUBMITTED', 'NEEDS_CHANGES', 'APPROVED', 'CANCELLED');
CREATE TYPE "RevisionSubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED');
CREATE TYPE "ArchiveRecordStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'NEEDS_SUPPLEMENT', 'APPROVED', 'COMPLETED', 'LOCKED');

CREATE TABLE "revision_requests" (
  "id" TEXT NOT NULL,
  "finalResultId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "defenseScheduleId" TEXT,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "RevisionRequestStatus" NOT NULL DEFAULT 'PENDING_SUBMISSION',
  "dueDate" TIMESTAMP(3),
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "revision_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revision_submissions" (
  "id" TEXT NOT NULL,
  "revisionRequestId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "reportFileId" TEXT,
  "note" TEXT,
  "status" "RevisionSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "revision_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "archive_records" (
  "id" TEXT NOT NULL,
  "finalResultId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "revisionRequestId" TEXT,
  "finalReportFileId" TEXT,
  "finalSlideFileId" TEXT,
  "sourceCodeFileId" TEXT,
  "additionalDocumentFileId" TEXT,
  "status" "ArchiveRecordStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "archiveStaffId" TEXT,
  "archiveNote" TEXT,
  "supplementReason" TEXT,
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lockedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "archive_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_record_locks" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "finalResultId" TEXT NOT NULL,
  "archiveRecordId" TEXT NOT NULL,
  "lockedById" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "project_record_locks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "revision_requests_finalResultId_key" ON "revision_requests"("finalResultId");
CREATE INDEX "revision_requests_studentId_idx" ON "revision_requests"("studentId");
CREATE INDEX "revision_requests_status_idx" ON "revision_requests"("status");
CREATE UNIQUE INDEX "revision_submissions_revisionRequestId_versionNumber_key" ON "revision_submissions"("revisionRequestId", "versionNumber");
CREATE INDEX "revision_submissions_studentId_idx" ON "revision_submissions"("studentId");
CREATE UNIQUE INDEX "archive_records_finalResultId_key" ON "archive_records"("finalResultId");
CREATE UNIQUE INDEX "archive_records_revisionRequestId_key" ON "archive_records"("revisionRequestId");
CREATE INDEX "archive_records_studentId_idx" ON "archive_records"("studentId");
CREATE INDEX "archive_records_status_idx" ON "archive_records"("status");
CREATE UNIQUE INDEX "project_record_locks_finalResultId_key" ON "project_record_locks"("finalResultId");
CREATE UNIQUE INDEX "project_record_locks_archiveRecordId_key" ON "project_record_locks"("archiveRecordId");
CREATE UNIQUE INDEX "project_record_locks_studentId_projectPeriodId_key" ON "project_record_locks"("studentId", "projectPeriodId");

ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_finalResultId_fkey" FOREIGN KEY ("finalResultId") REFERENCES "final_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "revision_submissions" ADD CONSTRAINT "revision_submissions_revisionRequestId_fkey" FOREIGN KEY ("revisionRequestId") REFERENCES "revision_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_submissions" ADD CONSTRAINT "revision_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_submissions" ADD CONSTRAINT "revision_submissions_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_finalResultId_fkey" FOREIGN KEY ("finalResultId") REFERENCES "final_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_revisionRequestId_fkey" FOREIGN KEY ("revisionRequestId") REFERENCES "revision_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_archiveStaffId_fkey" FOREIGN KEY ("archiveStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_finalReportFileId_fkey" FOREIGN KEY ("finalReportFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_finalSlideFileId_fkey" FOREIGN KEY ("finalSlideFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_sourceCodeFileId_fkey" FOREIGN KEY ("sourceCodeFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_additionalDocumentFileId_fkey" FOREIGN KEY ("additionalDocumentFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_record_locks" ADD CONSTRAINT "project_record_locks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_record_locks" ADD CONSTRAINT "project_record_locks_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_record_locks" ADD CONSTRAINT "project_record_locks_finalResultId_fkey" FOREIGN KEY ("finalResultId") REFERENCES "final_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_record_locks" ADD CONSTRAINT "project_record_locks_archiveRecordId_fkey" FOREIGN KEY ("archiveRecordId") REFERENCES "archive_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_record_locks" ADD CONSTRAINT "project_record_locks_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
