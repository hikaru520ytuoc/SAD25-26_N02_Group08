-- Sprint 7: council scoring, score summary, final result publication and defense session.

CREATE TYPE "FinalResultStatus" AS ENUM ('PASSED', 'FAILED', 'PASSED_WITH_REVISION');
CREATE TYPE "ResultPublicationStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PUBLISHED');
CREATE TYPE "DefenseSessionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "council_scores" (
  "id" TEXT NOT NULL,
  "defenseScheduleId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "councilId" TEXT NOT NULL,
  "councilMemberId" TEXT NOT NULL,
  "lecturerId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "comment" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "council_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "score_summaries" (
  "id" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "defenseScheduleId" TEXT NOT NULL,
  "supervisorScore" DOUBLE PRECISION NOT NULL,
  "reviewerScore" DOUBLE PRECISION NOT NULL,
  "councilAverageScore" DOUBLE PRECISION NOT NULL,
  "finalScore" DOUBLE PRECISION NOT NULL,
  "calculatedById" TEXT NOT NULL,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "score_summaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "final_results" (
  "id" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "defenseScheduleId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "supervisorScore" DOUBLE PRECISION NOT NULL,
  "reviewerScore" DOUBLE PRECISION NOT NULL,
  "councilAverageScore" DOUBLE PRECISION NOT NULL,
  "finalScore" DOUBLE PRECISION NOT NULL,
  "resultStatus" "FinalResultStatus" NOT NULL,
  "publicationStatus" "ResultPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "revisionRequired" BOOLEAN NOT NULL DEFAULT false,
  "revisionNote" TEXT,
  "confirmedById" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "publishedById" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "final_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "defense_sessions" (
  "id" TEXT NOT NULL,
  "defenseScheduleId" TEXT NOT NULL,
  "defenseRegistrationId" TEXT NOT NULL,
  "councilId" TEXT NOT NULL,
  "sessionStatus" "DefenseSessionStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "generalComment" TEXT,
  "conclusion" TEXT,
  "revisionRequired" BOOLEAN NOT NULL DEFAULT false,
  "revisionNote" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "defense_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "council_scores_defenseScheduleId_councilMemberId_key" ON "council_scores"("defenseScheduleId", "councilMemberId");
CREATE INDEX "council_scores_defenseRegistrationId_idx" ON "council_scores"("defenseRegistrationId");
CREATE INDEX "council_scores_councilId_idx" ON "council_scores"("councilId");
CREATE UNIQUE INDEX "score_summaries_defenseRegistrationId_key" ON "score_summaries"("defenseRegistrationId");
CREATE UNIQUE INDEX "score_summaries_defenseScheduleId_key" ON "score_summaries"("defenseScheduleId");
CREATE UNIQUE INDEX "final_results_defenseRegistrationId_key" ON "final_results"("defenseRegistrationId");
CREATE UNIQUE INDEX "final_results_defenseScheduleId_key" ON "final_results"("defenseScheduleId");
CREATE INDEX "final_results_studentId_idx" ON "final_results"("studentId");
CREATE INDEX "final_results_publicationStatus_idx" ON "final_results"("publicationStatus");
CREATE INDEX "final_results_resultStatus_idx" ON "final_results"("resultStatus");
CREATE UNIQUE INDEX "defense_sessions_defenseScheduleId_key" ON "defense_sessions"("defenseScheduleId");
CREATE UNIQUE INDEX "defense_sessions_defenseRegistrationId_key" ON "defense_sessions"("defenseRegistrationId");
CREATE INDEX "defense_sessions_councilId_idx" ON "defense_sessions"("councilId");

ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "defense_councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_councilMemberId_fkey" FOREIGN KEY ("councilMemberId") REFERENCES "council_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "council_scores" ADD CONSTRAINT "council_scores_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "score_summaries" ADD CONSTRAINT "score_summaries_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "score_summaries" ADD CONSTRAINT "score_summaries_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "score_summaries" ADD CONSTRAINT "score_summaries_calculatedById_fkey" FOREIGN KEY ("calculatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "final_results" ADD CONSTRAINT "final_results_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "final_results" ADD CONSTRAINT "final_results_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "final_results" ADD CONSTRAINT "final_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "final_results" ADD CONSTRAINT "final_results_projectPeriodId_fkey" FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "final_results" ADD CONSTRAINT "final_results_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "final_results" ADD CONSTRAINT "final_results_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "defense_sessions" ADD CONSTRAINT "defense_sessions_defenseScheduleId_fkey" FOREIGN KEY ("defenseScheduleId") REFERENCES "defense_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_sessions" ADD CONSTRAINT "defense_sessions_defenseRegistrationId_fkey" FOREIGN KEY ("defenseRegistrationId") REFERENCES "defense_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_sessions" ADD CONSTRAINT "defense_sessions_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "defense_councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "defense_sessions" ADD CONSTRAINT "defense_sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
