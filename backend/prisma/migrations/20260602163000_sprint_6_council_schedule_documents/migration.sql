-- Sprint 6: defense council, defense schedule and defense document workflow

-- Extend file document type enum for final defense document package.
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'DEFENSE_REPORT_FINAL';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'DEFENSE_SLIDE_FINAL';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'DEFENSE_SUPPLEMENT';
ALTER TYPE "FileDocumentType" ADD VALUE IF NOT EXISTS 'DEFENSE_OTHER_DOCUMENT';

-- CreateEnum
CREATE TYPE "DefenseCouncilStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CouncilRole" AS ENUM ('CHAIR', 'SECRETARY', 'MEMBER');

-- CreateEnum
CREATE TYPE "DefenseScheduleStatus" AS ENUM ('SCHEDULED', 'DOCUMENT_PENDING', 'DOCUMENT_NEEDS_SUPPLEMENT', 'DOCUMENT_APPROVED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DefenseDocumentStatus" AS ENUM ('SUBMITTED', 'NEEDS_SUPPLEMENT', 'APPROVED');

-- CreateTable
CREATE TABLE "defense_councils" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "facultyId" TEXT,
  "description" TEXT,
  "status" "DefenseCouncilStatus" NOT NULL DEFAULT 'DRAFT',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "defense_councils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "council_members" (
  "id" TEXT NOT NULL,
  "councilId" TEXT NOT NULL,
  "lecturerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleInCouncil" "CouncilRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "council_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_schedules" (
  "id" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "councilId" TEXT NOT NULL,
  "room" TEXT NOT NULL,
  "defenseDate" TIMESTAMP(3) NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "status" "DefenseScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "defense_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defense_documents" (
  "id" TEXT NOT NULL,
  "defenseScheduleId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "reportFileId" TEXT,
  "slideFileId" TEXT,
  "additionalFileId" TEXT,
  "status" "DefenseDocumentStatus" NOT NULL DEFAULT 'SUBMITTED',
  "secretaryId" TEXT,
  "secretaryNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "defense_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "defense_councils_projectPeriodId_idx" ON "defense_councils"("projectPeriodId");
CREATE INDEX "defense_councils_status_idx" ON "defense_councils"("status");
CREATE UNIQUE INDEX "council_members_councilId_lecturerId_key" ON "council_members"("councilId", "lecturerId");
CREATE INDEX "council_members_userId_idx" ON "council_members"("userId");
CREATE INDEX "council_members_roleInCouncil_idx" ON "council_members"("roleInCouncil");
CREATE UNIQUE INDEX "defense_schedules_defenseRegistrationId_key" ON "defense_schedules"("defenseRegistrationId");
CREATE INDEX "defense_schedules_studentId_idx" ON "defense_schedules"("studentId");
CREATE INDEX "defense_schedules_councilId_idx" ON "defense_schedules"("councilId");
CREATE INDEX "defense_schedules_projectPeriodId_idx" ON "defense_schedules"("projectPeriodId");
CREATE INDEX "defense_schedules_status_idx" ON "defense_schedules"("status");
CREATE UNIQUE INDEX "defense_documents_defenseScheduleId_key" ON "defense_documents"("defenseScheduleId");
CREATE UNIQUE INDEX "defense_documents_defenseRegistrationId_key" ON "defense_documents"("defenseRegistrationId");
CREATE INDEX "defense_documents_studentId_idx" ON "defense_documents"("studentId");
CREATE INDEX "defense_documents_status_idx" ON "defense_documents"("status");

-- AddForeignKey
ALTER TABLE "defense_councils" ADD CONSTRAINT "defense_councils_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_councils" ADD CONSTRAINT "defense_councils_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_councils" ADD CONSTRAINT "defense_councils_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "council_members" ADD CONSTRAINT "council_members_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "defense_councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "council_members" ADD CONSTRAINT "council_members_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "council_members" ADD CONSTRAINT "council_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "defense_schedules" ADD CONSTRAINT "defense_schedules_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_schedules" ADD CONSTRAINT "defense_schedules_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_schedules" ADD CONSTRAINT "defense_schedules_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_schedules" ADD CONSTRAINT "defense_schedules_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "defense_councils"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "defense_schedules" ADD CONSTRAINT "defense_schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_slideFileId_fkey" FOREIGN KEY ("slideFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_additionalFileId_fkey" FOREIGN KEY ("additionalFileId") REFERENCES "file_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "defense_documents" ADD CONSTRAINT "defense_documents_secretaryId_fkey" FOREIGN KEY ("secretaryId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
