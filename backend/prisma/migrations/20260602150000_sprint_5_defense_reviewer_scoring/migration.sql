-- Sprint 5: defense registration, reviewer assignment and scoring workflow

-- Extend file document type enum for defense materials.
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'DEFENSE_DOCUMENT';

-- CreateEnum
CREATE TYPE "DefenseRegistrationStatus" AS ENUM (
  'SUBMITTED',
  'NEEDS_REVISION',
  'APPROVED_BY_SUPERVISOR',
  'REJECTED_BY_SUPERVISOR',
  'SENT_TO_REVIEWER',
  'REVIEWER_NEEDS_REVISION',
  'APPROVED_BY_REVIEWER',
  'READY_FOR_COUNCIL'
);

-- CreateEnum
CREATE TYPE "ReviewerAssignmentStatus" AS ENUM ('ASSIGNED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewerEligibilityStatus" AS ENUM ('ELIGIBLE_FOR_DEFENSE', 'NOT_ELIGIBLE_FOR_DEFENSE');

-- CreateTable
CREATE TABLE "defense_registrations" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "supervisorId" TEXT NOT NULL,
  "supervisorAssignmentId" TEXT NOT NULL,
  "topicRegistrationId" TEXT NOT NULL,
  "outlineId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "reportFileId" TEXT,
  "slideFileId" TEXT,
  "additionalDocumentFileId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "studentNote" TEXT,
  "status" "DefenseRegistrationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "supervisorFeedback" TEXT,
  "supervisorReviewedAt" TIMESTAMP(3),
  "supervisorReviewedById" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "defense_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewer_assignments" (
  "id" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "supervisorId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "assignedById" TEXT NOT NULL,
  "status" "ReviewerAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviewer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewer_evaluations" (
  "id" TEXT NOT NULL,
  "reviewerAssignmentId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "strengths" TEXT,
  "weaknesses" TEXT,
  "questionSuggestions" TEXT,
  "eligibilityStatus" "ReviewerEligibilityStatus" NOT NULL,
  "feedbackToStudent" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviewer_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisor_scores" (
  "id" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "supervisorId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "supervisor_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewer_scores" (
  "id" TEXT NOT NULL,
  "reviewerAssignmentId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviewer_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "defense_registrations_topicRegistrationId_key" ON "defense_registrations"("topicRegistrationId");
CREATE UNIQUE INDEX "defense_registrations_studentId_projectPeriodId_key" ON "defense_registrations"("studentId", "projectPeriodId");
CREATE INDEX "defense_registrations_supervisorId_idx" ON "defense_registrations"("supervisorId");
CREATE INDEX "defense_registrations_status_idx" ON "defense_registrations"("status");
CREATE UNIQUE INDEX "reviewer_assignments_defenseRegistrationId_key" ON "reviewer_assignments"("defenseRegistrationId");
CREATE INDEX "reviewer_assignments_reviewerId_idx" ON "reviewer_assignments"("reviewerId");
CREATE INDEX "reviewer_assignments_projectPeriodId_idx" ON "reviewer_assignments"("projectPeriodId");
CREATE UNIQUE INDEX "reviewer_evaluations_reviewerAssignmentId_key" ON "reviewer_evaluations"("reviewerAssignmentId");
CREATE INDEX "reviewer_evaluations_reviewerId_idx" ON "reviewer_evaluations"("reviewerId");
CREATE UNIQUE INDEX "supervisor_scores_defenseRegistrationId_key" ON "supervisor_scores"("defenseRegistrationId");
CREATE INDEX "supervisor_scores_supervisorId_idx" ON "supervisor_scores"("supervisorId");
CREATE UNIQUE INDEX "reviewer_scores_reviewerAssignmentId_key" ON "reviewer_scores"("reviewerAssignmentId");
CREATE INDEX "reviewer_scores_reviewerId_idx" ON "reviewer_scores"("reviewerId");

-- AddForeignKey
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_supervisorAssignmentId_fkey" FOREIGN KEY ("supervisorAssignmentId") REFERENCES "supervisor_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_topicRegistrationId_fkey" FOREIGN KEY ("topicRegistrationId") REFERENCES "topic_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_outlineId_fkey" FOREIGN KEY ("outlineId") REFERENCES "outlines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_slideFileId_fkey" FOREIGN KEY ("slideFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_additionalDocumentFileId_fkey" FOREIGN KEY ("additionalDocumentFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_registrations" ADD CONSTRAINT "defense_registrations_supervisorReviewedById_fkey" FOREIGN KEY ("supervisorReviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviewer_assignments" ADD CONSTRAINT "reviewer_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviewer_evaluations" ADD CONSTRAINT "reviewer_evaluations_reviewerAssignmentId_fkey" FOREIGN KEY ("reviewerAssignmentId") REFERENCES "reviewer_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviewer_evaluations" ADD CONSTRAINT "reviewer_evaluations_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviewer_evaluations" ADD CONSTRAINT "reviewer_evaluations_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "supervisor_scores" ADD CONSTRAINT "supervisor_scores_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supervisor_scores" ADD CONSTRAINT "supervisor_scores_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviewer_scores" ADD CONSTRAINT "reviewer_scores_reviewerAssignmentId_fkey" FOREIGN KEY ("reviewerAssignmentId") REFERENCES "reviewer_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviewer_scores" ADD CONSTRAINT "reviewer_scores_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
