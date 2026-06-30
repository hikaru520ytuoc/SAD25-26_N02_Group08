import { AcademicStatus, EligibilityStatus, InternshipStatus } from '@prisma/client';

export const DEFAULT_MIN_GPA = 2.0;

export type StudentEligibilityEvaluationInput = {
  internshipStatus: InternshipStatus;
  academicStatus?: AcademicStatus | null;
  completedCredits?: number | null;
  requiredCredits?: number | null;
  gpa?: number | null;
  hasPrerequisiteDebt?: boolean | null;
  hasTuitionDebt?: boolean | null;
  hasDisciplinaryAction?: boolean | null;
};

export type StudentEligibilityEvaluationResult = {
  eligible: boolean;
  reasons: string[];
};

export function evaluateStudentEligibility(
  input: StudentEligibilityEvaluationInput,
  minGpa = DEFAULT_MIN_GPA,
): StudentEligibilityEvaluationResult {
  const reasons: string[] = [];

  if (input.internshipStatus === InternshipStatus.NOT_COMPLETED) {
    reasons.push('Sinh viên chưa hoàn thành thực tập');
  }

  if ((input.academicStatus ?? AcademicStatus.ACTIVE) !== AcademicStatus.ACTIVE) {
    reasons.push('Trạng thái học vụ không phải ACTIVE');
  }

  if (input.completedCredits === null || input.completedCredits === undefined) {
    reasons.push('Chưa nhập số tín chỉ đã tích lũy');
  }

  if (input.requiredCredits === null || input.requiredCredits === undefined) {
    reasons.push('Chưa nhập số tín chỉ yêu cầu');
  }

  if (
    input.completedCredits !== null &&
    input.completedCredits !== undefined &&
    input.requiredCredits !== null &&
    input.requiredCredits !== undefined &&
    input.completedCredits < input.requiredCredits
  ) {
    reasons.push(`Số tín chỉ đã tích lũy (${input.completedCredits}) nhỏ hơn số tín chỉ yêu cầu (${input.requiredCredits})`);
  }

  if (input.gpa === null || input.gpa === undefined) {
    reasons.push('Chưa nhập GPA/CPA');
  } else if (input.gpa < minGpa) {
    reasons.push(`GPA/CPA (${input.gpa}) nhỏ hơn ngưỡng tối thiểu ${minGpa}`);
  }

  if (input.hasPrerequisiteDebt) {
    reasons.push('Sinh viên còn nợ môn tiên quyết');
  }

  if (input.hasTuitionDebt) {
    reasons.push('Sinh viên còn nợ học phí');
  }

  if (input.hasDisciplinaryAction) {
    reasons.push('Sinh viên đang có tình trạng kỷ luật');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function resolveEligibilityStatusFromEvaluation(
  evaluation: StudentEligibilityEvaluationResult,
  requestedStatus?: EligibilityStatus,
): EligibilityStatus {
  if (requestedStatus === EligibilityStatus.PENDING) return EligibilityStatus.PENDING;
  if (requestedStatus === EligibilityStatus.NOT_ELIGIBLE) return EligibilityStatus.NOT_ELIGIBLE;
  return evaluation.eligible ? EligibilityStatus.ELIGIBLE : EligibilityStatus.NOT_ELIGIBLE;
}

export function buildEligibilityReason(
  providedReason: string | undefined,
  evaluation: StudentEligibilityEvaluationResult,
): string | undefined {
  if (providedReason?.trim()) return providedReason.trim();
  if (!evaluation.eligible) return evaluation.reasons.join('; ');
  return undefined;
}
