import { z } from 'zod';

export const defenseRegistrationSchema = z.object({
  title: z.string().min(1, 'Tên hồ sơ/báo cáo không được rỗng'),
  summary: z.string().optional(),
  studentNote: z.string().optional(),
  reportFileId: z.string().uuid('Cần upload file báo cáo'),
  slideFileId: z.string().uuid().optional(),
  additionalDocumentFileId: z.string().uuid().optional(),
});

export const supervisorApproveDefenseSchema = z.object({
  score: z.coerce.number().min(0, 'Điểm không được nhỏ hơn 0').max(10, 'Điểm không được lớn hơn 10'),
  comment: z.string().optional(),
});

export const supervisorRejectDefenseSchema = z.object({
  feedback: z.string().min(1, 'Feedback là bắt buộc'),
});

export const reviewerAssignmentSchema = z.object({
  defenseRegistrationId: z.string().uuid(),
  reviewerId: z.string().uuid('Cần chọn GVPB'),
});

export const reviewerEvaluationSchema = z.object({
  reviewerAssignmentId: z.string().uuid(),
  comment: z.string().min(1, 'Nhận xét phản biện không được rỗng'),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  questionSuggestions: z.string().optional(),
  eligibilityStatus: z.enum(['ELIGIBLE_FOR_DEFENSE', 'NOT_ELIGIBLE_FOR_DEFENSE']),
  feedbackToStudent: z.string().optional(),
  score: z.coerce.number().min(0).max(10).optional(),
  scoreComment: z.string().optional(),
});

export type DefenseRegistrationValues = z.infer<typeof defenseRegistrationSchema>;
export type SupervisorApproveDefenseValues = z.infer<typeof supervisorApproveDefenseSchema>;
export type SupervisorRejectDefenseValues = z.infer<typeof supervisorRejectDefenseSchema>;
export type ReviewerAssignmentValues = z.infer<typeof reviewerAssignmentSchema>;
export type ReviewerEvaluationValues = z.infer<typeof reviewerEvaluationSchema>;
