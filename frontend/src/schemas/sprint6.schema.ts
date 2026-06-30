import { z } from 'zod';

export const councilSchema = z.object({
  name: z.string().min(3, 'Tên hội đồng không được để trống'),
  projectPeriodId: z.string().min(1, 'Vui lòng chọn đợt đồ án.'),
  facultyId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED']).optional(),
});
export type CouncilValues = z.infer<typeof councilSchema>;

export const councilMemberSchema = z.object({
  lecturerId: z.string().min(1, 'Vui lòng chọn giảng viên.'),
  roleInCouncil: z.enum(['CHAIR', 'SECRETARY', 'MEMBER']),
});
export type CouncilMemberValues = z.infer<typeof councilMemberSchema>;

export const defenseScheduleSchema = z.object({
  defenseRegistrationId: z.string().min(1, 'Vui lòng chọn hồ sơ bảo vệ.'),
  councilId: z.string().min(1, 'Vui lòng chọn hội đồng.'),
  room: z.string().min(1, 'Phòng bảo vệ không được để trống'),
  defenseDate: z.string().min(1, 'Ngày bảo vệ là bắt buộc'),
  startTime: z.string().min(1, 'Giờ bắt đầu là bắt buộc'),
  endTime: z.string().min(1, 'Giờ kết thúc là bắt buộc'),
});
export type DefenseScheduleValues = z.infer<typeof defenseScheduleSchema>;

export const defenseDocumentSchema = z.object({
  reportFileId: z.string().min(1, 'Vui lòng upload báo cáo.'),
  slideFileId: z.string().min(1, 'Vui lòng upload slide.'),
  additionalFileId: z.string().optional(),
});
export type DefenseDocumentValues = z.infer<typeof defenseDocumentSchema>;

export const requestSupplementSchema = z.object({
  secretaryNote: z.string().min(3, 'Lý do yêu cầu bổ sung là bắt buộc'),
});
export type RequestSupplementValues = z.infer<typeof requestSupplementSchema>;
