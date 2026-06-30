-- Sprint validation patch: manual academic eligibility fields and council scheduling constraints support
ALTER TABLE "students"
  ADD COLUMN IF NOT EXISTS "completedCredits" INTEGER,
  ADD COLUMN IF NOT EXISTS "requiredCredits" INTEGER,
  ADD COLUMN IF NOT EXISTS "gpa" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "hasPrerequisiteDebt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasTuitionDebt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasDisciplinaryAction" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "student_eligibilities"
  ADD COLUMN IF NOT EXISTS "completedCredits" INTEGER,
  ADD COLUMN IF NOT EXISTS "requiredCredits" INTEGER,
  ADD COLUMN IF NOT EXISTS "gpa" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "hasPrerequisiteDebt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasTuitionDebt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasDisciplinaryAction" BOOLEAN NOT NULL DEFAULT false;
