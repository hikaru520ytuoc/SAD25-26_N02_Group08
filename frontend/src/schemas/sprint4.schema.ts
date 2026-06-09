import { z } from 'zod';

export const outlineSchema = z.object({
  title: z.string().min(1, 'Tên đề cương không được rỗng'),
  summary: z.string().min(1, 'Tóm tắt đề cương không được rỗng'),
  objectives: z.string().optional(),
  methodology: z.string().optional(),
  expectedOutput: z.string().optional(),
  timeline: z.string().optional(),
  fileDocumentId: z.string().optional(),
  submitNote: z.string().optional(),
});

export const requestRevisionSchema = z.object({
  feedback: z.string().min(1, 'Feedback là bắt buộc'),
});

export const progressSchema = z.object({
  title: z.string().min(1, 'Tiêu đề tiến độ không được rỗng'),
  content: z.string().min(1, 'Nội dung tiến độ không được rỗng'),
  progressPercent: z.coerce.number().min(0).max(100).optional(),
  fileDocumentId: z.string().optional(),
});

export const progressCommentSchema = z.object({
  comment: z.string().min(1, 'Nội dung góp ý không được rỗng'),
});

export type OutlineFormValues = z.infer<typeof outlineSchema>;
export type RequestRevisionValues = z.infer<typeof requestRevisionSchema>;
export type ProgressFormValues = z.infer<typeof progressSchema>;
export type ProgressCommentValues = z.infer<typeof progressCommentSchema>;
