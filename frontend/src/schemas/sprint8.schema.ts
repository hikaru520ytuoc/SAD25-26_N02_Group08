import { z } from 'zod';

export const revisionSubmissionSchema = z.object({ reportFileId: z.string().uuid('File bản chỉnh sửa bắt buộc'), note: z.string().optional() });
export type RevisionSubmissionValues = z.infer<typeof revisionSubmissionSchema>;

export const requestRevisionChangesSchema = z.object({ feedback: z.string().min(1, 'Feedback bắt buộc') });
export type RequestRevisionChangesValues = z.infer<typeof requestRevisionChangesSchema>;

export const archiveSubmissionSchema = z.object({ finalResultId: z.string().uuid().optional(), finalReportFileId: z.string().uuid('Báo cáo cuối cùng bắt buộc'), finalSlideFileId: z.string().uuid().optional(), sourceCodeFileId: z.string().uuid().optional(), additionalDocumentFileId: z.string().uuid().optional(), archiveNote: z.string().optional() });
export type ArchiveSubmissionValues = z.infer<typeof archiveSubmissionSchema>;

export const archiveSupplementSchema = z.object({ supplementReason: z.string().min(1, 'Lý do bổ sung bắt buộc') });
export type ArchiveSupplementValues = z.infer<typeof archiveSupplementSchema>;
