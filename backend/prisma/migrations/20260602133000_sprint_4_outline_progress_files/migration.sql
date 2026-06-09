-- CreateEnum
CREATE TYPE "OutlineStatus" AS ENUM ('SUBMITTED', 'NEEDS_REVISION', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProjectProgressStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "FileDocumentType" AS ENUM ('OUTLINE', 'PROGRESS_DRAFT', 'REPORT', 'SLIDE', 'REVISION', 'ARCHIVE', 'OTHER');

-- CreateTable
CREATE TABLE "file_documents" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "fileType" "FileDocumentType" NOT NULL DEFAULT 'OTHER',
    "relatedType" TEXT,
    "relatedId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "file_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlines" (
    "id" TEXT NOT NULL,
    "topicRegistrationId" TEXT NOT NULL,
    "supervisorAssignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "projectPeriodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "objectives" TEXT,
    "methodology" TEXT,
    "expectedOutput" TEXT,
    "timeline" TEXT,
    "status" "OutlineStatus" NOT NULL DEFAULT 'SUBMITTED',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outline_versions" (
    "id" TEXT NOT NULL,
    "outlineId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "objectives" TEXT,
    "methodology" TEXT,
    "expectedOutput" TEXT,
    "timeline" TEXT,
    "fileDocumentId" TEXT,
    "submitNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outline_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "supervisorAssignmentId" TEXT NOT NULL,
    "projectPeriodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "progressPercent" INTEGER,
    "status" "ProjectProgressStatus" NOT NULL DEFAULT 'SUBMITTED',
    "fileDocumentId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progress_comments" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "commenterId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_progress_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outlines_topicRegistrationId_key" ON "outlines"("topicRegistrationId");
CREATE INDEX "outlines_studentId_idx" ON "outlines"("studentId");
CREATE INDEX "outlines_supervisorId_idx" ON "outlines"("supervisorId");
CREATE INDEX "outlines_status_idx" ON "outlines"("status");
CREATE UNIQUE INDEX "outline_versions_outlineId_versionNumber_key" ON "outline_versions"("outlineId", "versionNumber");
CREATE INDEX "project_progress_studentId_idx" ON "project_progress"("studentId");
CREATE INDEX "project_progress_supervisorId_idx" ON "project_progress"("supervisorId");
CREATE INDEX "project_progress_supervisorAssignmentId_idx" ON "project_progress"("supervisorAssignmentId");
CREATE INDEX "project_progress_comments_progressId_idx" ON "project_progress_comments"("progressId");
CREATE INDEX "file_documents_ownerId_idx" ON "file_documents"("ownerId");
CREATE INDEX "file_documents_relatedType_relatedId_idx" ON "file_documents"("relatedType", "relatedId");

-- AddForeignKey
ALTER TABLE "file_documents" ADD CONSTRAINT "file_documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "file_documents" ADD CONSTRAINT "file_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_topicRegistrationId_fkey" FOREIGN KEY ("topicRegistrationId") REFERENCES "topic_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_supervisorAssignmentId_fkey" FOREIGN KEY ("supervisorAssignmentId") REFERENCES "supervisor_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outlines" ADD CONSTRAINT "outlines_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "outline_versions" ADD CONSTRAINT "outline_versions_outlineId_fkey" FOREIGN KEY ("outlineId") REFERENCES "outlines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outline_versions" ADD CONSTRAINT "outline_versions_fileDocumentId_fkey" FOREIGN KEY ("fileDocumentId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_supervisorAssignmentId_fkey" FOREIGN KEY ("supervisorAssignmentId") REFERENCES "supervisor_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_progress" ADD CONSTRAINT "project_progress_fileDocumentId_fkey" FOREIGN KEY ("fileDocumentId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_progress_comments" ADD CONSTRAINT "project_progress_comments_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "project_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_progress_comments" ADD CONSTRAINT "project_progress_comments_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
