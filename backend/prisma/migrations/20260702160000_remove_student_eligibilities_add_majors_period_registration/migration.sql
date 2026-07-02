-- Replace stored per-period eligibility records with live eligibility calculated from
-- the student's academic profile and the total credits of the selected major.

CREATE TABLE "majors" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "totalCredits" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "majors_code_key" ON "majors"("code");

INSERT INTO "majors" ("id", "code", "name", "totalCredits", "updatedAt") VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'KTPM', 'Kỹ thuật phần mềm', 134, CURRENT_TIMESTAMP),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'CNTT', 'Công nghệ thông tin', 136, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "totalCredits" = EXCLUDED."totalCredits",
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "students"
  ADD COLUMN "majorId" TEXT,
  ADD COLUMN "accumulatedCredits" INTEGER,
  ADD COLUMN "academicStatus" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE';

-- Do not silently assign an unknown legacy major to the wrong programme.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "students"
    WHERE UPPER(TRIM(COALESCE("major", ''))) NOT IN (
      'KTPM', 'KỸ THUẬT PHẦN MỀM', 'KY THUAT PHAN MEM', 'SOFTWARE ENGINEERING',
      'CNTT', 'CÔNG NGHỆ THÔNG TIN', 'CONG NGHE THONG TIN', 'INFORMATION TECHNOLOGY'
    )
  ) THEN
    RAISE EXCEPTION 'Tồn tại ngành cũ chưa thể ánh xạ sang KTPM hoặc CNTT. Hãy chuẩn hóa cột students.major trước khi chạy migration.';
  END IF;
END $$;

UPDATE "students"
SET "majorId" = CASE
  WHEN UPPER(TRIM(COALESCE("major", ''))) IN ('CNTT', 'CÔNG NGHỆ THÔNG TIN', 'CONG NGHE THONG TIN', 'INFORMATION TECHNOLOGY')
    THEN 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  WHEN UPPER(TRIM(COALESCE("major", ''))) IN ('KTPM', 'KỸ THUẬT PHẦN MỀM', 'KY THUAT PHAN MEM', 'SOFTWARE ENGINEERING')
    THEN 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
END,
"accumulatedCredits" = COALESCE("completedCredits", 0),
"gpa" = COALESCE("gpa", 0);

-- Preserve the latest academic values that were previously entered through
-- student_eligibilities before removing that table. requiredCredits is not
-- migrated because the new threshold is calculated from Major.totalCredits.
WITH latest_eligibility AS (
  SELECT DISTINCT ON ("studentId")
    "studentId",
    "internshipStatus",
    "academicStatus",
    "completedCredits",
    "gpa",
    "hasPrerequisiteDebt",
    "hasTuitionDebt",
    "hasDisciplinaryAction"
  FROM "student_eligibilities"
  ORDER BY "studentId", COALESCE("checkedAt", "updatedAt", "createdAt") DESC
)
UPDATE "students" AS student
SET
  "internshipStatus" = latest."internshipStatus",
  "academicStatus" = latest."academicStatus",
  "accumulatedCredits" = COALESCE(latest."completedCredits", student."accumulatedCredits", 0),
  "gpa" = COALESCE(latest."gpa", student."gpa", 0),
  "hasPrerequisiteDebt" = latest."hasPrerequisiteDebt",
  "hasTuitionDebt" = latest."hasTuitionDebt",
  "hasDisciplinaryAction" = latest."hasDisciplinaryAction"
FROM latest_eligibility AS latest
WHERE student."id" = latest."studentId";

ALTER TABLE "students"
  ALTER COLUMN "majorId" SET NOT NULL,
  ALTER COLUMN "accumulatedCredits" SET NOT NULL,
  ALTER COLUMN "accumulatedCredits" SET DEFAULT 0,
  ALTER COLUMN "gpa" SET NOT NULL,
  ALTER COLUMN "gpa" SET DEFAULT 0;

ALTER TABLE "students"
  DROP COLUMN "major",
  DROP COLUMN "completedCredits",
  DROP COLUMN "requiredCredits";

CREATE INDEX "students_majorId_idx" ON "students"("majorId");
ALTER TABLE "students"
  ADD CONSTRAINT "students_majorId_fkey"
  FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TYPE "ProjectPeriodRegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED', 'COMPLETED');

CREATE TABLE "project_period_registrations" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "projectPeriodId" TEXT NOT NULL,
  "status" "ProjectPeriodRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
  "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_period_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_period_registrations_studentId_projectPeriodId_key"
  ON "project_period_registrations"("studentId", "projectPeriodId");
CREATE INDEX "project_period_registrations_studentId_status_idx"
  ON "project_period_registrations"("studentId", "status");
CREATE INDEX "project_period_registrations_projectPeriodId_status_idx"
  ON "project_period_registrations"("projectPeriodId", "status");

ALTER TABLE "project_period_registrations"
  ADD CONSTRAINT "project_period_registrations_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_period_registrations"
  ADD CONSTRAINT "project_period_registrations_projectPeriodId_fkey"
  FOREIGN KEY ("projectPeriodId") REFERENCES "project_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing workflows only for students who already created a topic registration.
-- Eligibility records alone are deliberately not converted into period registrations.
INSERT INTO "project_period_registrations" (
  "id", "studentId", "projectPeriodId", "status", "registeredAt", "createdAt", "updatedAt"
)
SELECT
  substr(md5(tr."studentId" || ':' || tr."projectPeriodId"), 1, 8) || '-' ||
  substr(md5(tr."studentId" || ':' || tr."projectPeriodId"), 9, 4) || '-4' ||
  substr(md5(tr."studentId" || ':' || tr."projectPeriodId"), 14, 3) || '-8' ||
  substr(md5(tr."studentId" || ':' || tr."projectPeriodId"), 18, 3) || '-' ||
  substr(md5(tr."studentId" || ':' || tr."projectPeriodId"), 21, 12),
  tr."studentId",
  tr."projectPeriodId",
  'REGISTERED'::"ProjectPeriodRegistrationStatus",
  MIN(tr."createdAt"),
  MIN(tr."createdAt"),
  CURRENT_TIMESTAMP
FROM "topic_registrations" tr
GROUP BY tr."studentId", tr."projectPeriodId"
ON CONFLICT ("studentId", "projectPeriodId") DO NOTHING;

DROP TABLE IF EXISTS "student_eligibilities";
DROP TYPE IF EXISTS "EligibilityStatus";
