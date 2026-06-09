-- CreateEnum
CREATE TYPE "TopicSource" AS ENUM ('SUPERVISOR_PROPOSED', 'STUDENT_PROPOSED');

-- CreateEnum
CREATE TYPE "TopicRegistrationType" AS ENUM ('EXISTING_TOPIC', 'STUDENT_PROPOSED');

-- CreateEnum
CREATE TYPE "SupervisorResponseStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TopicRegistrationStatus" AS ENUM ('DRAFT', 'PENDING_SUPERVISOR', 'PENDING_FACULTY', 'NEEDS_REVISION', 'FACULTY_APPROVED', 'FACULTY_REJECTED', 'CANCELLED', 'OFFICIALLY_ASSIGNED');

-- CreateEnum
CREATE TYPE "SupervisorAssignmentType" AS ENUM ('TOPIC_OWNER', 'STUDENT_REQUESTED', 'FACULTY_ASSIGNED');

-- CreateEnum
CREATE TYPE "SupervisorAssignmentStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "topics" ADD COLUMN "source" "TopicSource" NOT NULL DEFAULT 'SUPERVISOR_PROPOSED';
ALTER TABLE "topics" ADD COLUMN "proposedByStudentId" TEXT;

-- CreateTable
CREATE TABLE "topic_registrations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "projectPeriodId" TEXT NOT NULL,
    "registrationType" "TopicRegistrationType" NOT NULL,
    "topicId" TEXT,
    "proposedTitle" TEXT,
    "proposedDescription" TEXT,
    "proposedObjectives" TEXT,
    "proposedExpectedOutput" TEXT,
    "proposedMajor" TEXT,
    "requestedSupervisorId" TEXT,
    "supervisorResponseStatus" "SupervisorResponseStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "supervisorResponseNote" TEXT,
    "status" "TopicRegistrationStatus" NOT NULL DEFAULT 'DRAFT',
    "facultyNote" TEXT,
    "rejectedReason" TEXT,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisor_assignments" (
    "id" TEXT NOT NULL,
    "topicRegistrationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT,
    "projectPeriodId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignmentType" "SupervisorAssignmentType" NOT NULL,
    "status" "SupervisorAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "topic_registrations_studentId_projectPeriodId_idx" ON "topic_registrations"("studentId", "projectPeriodId");

-- CreateIndex
CREATE INDEX "topic_registrations_status_idx" ON "topic_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_assignments_topicRegistrationId_key" ON "supervisor_assignments"("topicRegistrationId");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_assignments_studentId_projectPeriodId_key" ON "supervisor_assignments"("studentId", "projectPeriodId");

-- CreateIndex
CREATE INDEX "supervisor_assignments_supervisorId_idx" ON "supervisor_assignments"("supervisorId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_proposedByStudentId_fkey" FOREIGN KEY ("proposedByStudentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_registrations" ADD CONSTRAINT "topic_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_registrations" ADD CONSTRAINT "topic_registrations_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_registrations" ADD CONSTRAINT "topic_registrations_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_registrations" ADD CONSTRAINT "topic_registrations_requestedSupervisorId_fkey" FOREIGN KEY ("requestedSupervisorId") REFERENCES "lecturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_registrations" ADD CONSTRAINT "topic_registrations_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_topicRegistrationId_fkey" FOREIGN KEY ("topicRegistrationId") REFERENCES "topic_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
