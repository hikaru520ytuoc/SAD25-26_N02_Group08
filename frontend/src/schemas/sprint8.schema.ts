import { z } from 'zod';

export const revisionSubmissionSchema = z.object({ reportFileId: z.string().min(1, 'Vui lòng upload bản chỉnh sửa.'), note: z.string().optional() });
export type RevisionSubmissionValues = z.infer<typeof revisionSubmissionSchema>;

export const requestRevisionChangesSchema = z.object({ feedback: z.string().min(1, 'Feedback bắt buộc') });
export type RequestRevisionChangesValues = z.infer<typeof requestRevisionChangesSchema>;

export const archiveSubmissionSchema = z.object({ finalResultId: z.string().min(1, 'Vui lòng chọn dữ liệu.').optional(), finalReportFileId: z.string().min(1, 'Vui lòng upload báo cáo cuối cùng.'), finalSlideFileId: z.string().min(1, 'Vui lòng chọn dữ liệu.').optional(), sourceCodeFileId: z.string().min(1, 'Vui lòng chọn dữ liệu.').optional(), additionalDocumentFileId: z.string().min(1, 'Vui lòng chọn dữ liệu.').optional(), archiveNote: z.string().optional() });
export type ArchiveSubmissionValues = z.infer<typeof archiveSubmissionSchema>;

export const archiveSupplementSchema = z.object({ supplementReason: z.string().min(1, 'Lý do bổ sung bắt buộc') });
export type ArchiveSupplementValues = z.infer<typeof archiveSupplementSchema>;
