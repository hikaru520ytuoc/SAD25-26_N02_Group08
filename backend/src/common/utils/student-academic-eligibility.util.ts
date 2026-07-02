import type { AcademicStatus, InternshipStatus, UserStatus } from '@prisma/client';

export const PROJECT_ELIGIBILITY_CREDIT_RATIO = 0.8;
export const PROJECT_ELIGIBILITY_MIN_GPA = 2.5;

export type StudentAcademicEligibilityInput = {
  major: {
    code: string;
    name: string;
    totalCredits: number;
  };
  accumulatedCredits: number;
  gpa: number;
  internshipStatus: InternshipStatus;
  academicStatus: AcademicStatus;
  hasPrerequisiteDebt: boolean;
  hasTuitionDebt: boolean;
  hasDisciplinaryAction: boolean;
  userStatus?: UserStatus;
};

export type StudentAcademicEligibilityResult = {
  eligible: boolean;
  requiredCredits: number;
  creditRatio: number;
  minimumGpa: number;
  checks: {
    credits: boolean;
    gpa: boolean;
    internship: boolean;
    academicStatus: boolean;
    prerequisiteDebt: boolean;
    tuitionDebt: boolean;
    disciplinaryAction: boolean;
    accountStatus: boolean;
  };
  reasons: string[];
};

export function calculateRequiredCredits(totalCredits: number) {
  return Math.ceil(totalCredits * PROJECT_ELIGIBILITY_CREDIT_RATIO);
}

export function evaluateStudentAcademicEligibility(
  input: StudentAcademicEligibilityInput,
): StudentAcademicEligibilityResult {
  const requiredCredits = calculateRequiredCredits(input.major.totalCredits);
  const checks = {
    credits: input.accumulatedCredits >= requiredCredits,
    gpa: input.gpa >= PROJECT_ELIGIBILITY_MIN_GPA,
    internship: input.internshipStatus === 'COMPLETED' || input.internshipStatus === 'WAIVED',
    academicStatus: input.academicStatus === 'ACTIVE',
    prerequisiteDebt: !input.hasPrerequisiteDebt,
    tuitionDebt: !input.hasTuitionDebt,
    disciplinaryAction: !input.hasDisciplinaryAction,
    accountStatus: !input.userStatus || input.userStatus === 'ACTIVE',
  };

  const reasons: string[] = [];
  if (!checks.credits) {
    reasons.push(`Còn thiếu ${requiredCredits - input.accumulatedCredits} tín chỉ để đạt 80% chương trình ${input.major.code}`);
  }
  if (!checks.gpa) {
    reasons.push(`GPA/CPA phải từ ${PROJECT_ELIGIBILITY_MIN_GPA.toFixed(1)} trở lên`);
  }
  if (!checks.internship) reasons.push('Chưa hoàn thành hoặc chưa được miễn thực tập');
  if (!checks.academicStatus) reasons.push('Trạng thái học vụ hiện tại không phải đang học');
  if (!checks.prerequisiteDebt) reasons.push('Còn nợ môn tiên quyết');
  if (!checks.tuitionDebt) reasons.push('Còn nợ học phí');
  if (!checks.disciplinaryAction) reasons.push('Đang có tình trạng kỷ luật');
  if (!checks.accountStatus) reasons.push('Tài khoản đang bị khóa');

  return {
    eligible: Object.values(checks).every(Boolean),
    requiredCredits,
    creditRatio: PROJECT_ELIGIBILITY_CREDIT_RATIO,
    minimumGpa: PROJECT_ELIGIBILITY_MIN_GPA,
    checks,
    reasons,
  };
}
