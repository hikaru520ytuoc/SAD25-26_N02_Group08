import { z } from 'zod';

export const councilScoreSchema = z.object({
  defenseScheduleId: z.string().uuid('Defense schedule không hợp lệ'),
  councilMemberId: z.string().uuid('Council member không hợp lệ'),
  score: z.coerce.number().min(0, 'Điểm tối thiểu 0').max(10, 'Điểm tối đa 10'),
  comment: z.string().optional(),
});

export const confirmResultSchema = z.object({
  resultStatus: z.enum(['PASSED', 'FAILED', 'PASSED_WITH_REVISION']),
  revisionRequired: z.boolean().optional(),
  revisionNote: z.string().optional(),
}).refine((value) => value.resultStatus !== 'PASSED_WITH_REVISION' || Boolean(value.revisionNote?.trim()), {
  message: 'Cần nhập ghi chú chỉnh sửa',
  path: ['revisionNote'],
});

export const defenseSessionSchema = z.object({
  defenseScheduleId: z.string().uuid(),
  sessionStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  generalComment: z.string().optional(),
  conclusion: z.string().optional(),
  revisionRequired: z.boolean().optional(),
  revisionNote: z.string().optional(),
});

export type CouncilScoreValues = z.infer<typeof councilScoreSchema>;
export type ConfirmResultValues = z.infer<typeof confirmResultSchema>;
export type DefenseSessionValues = z.infer<typeof defenseSessionSchema>;
