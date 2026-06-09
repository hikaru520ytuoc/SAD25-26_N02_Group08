import { z } from 'zod';

export const registerExistingTopicSchema = z.object({
  topicId: z.string().uuid('topicId phải là UUID'),
  projectPeriodId: z.string().uuid('projectPeriodId phải là UUID'),
});

export const proposeNewTopicSchema = z.object({
  projectPeriodId: z.string().uuid('projectPeriodId phải là UUID'),
  proposedTitle: z.string().min(5, 'Tên đề tài tối thiểu 5 ký tự'),
  proposedDescription: z.string().min(10, 'Mô tả đề tài tối thiểu 10 ký tự'),
  proposedObjectives: z.string().optional(),
  proposedExpectedOutput: z.string().optional(),
  proposedMajor: z.string().optional(),
  requestedSupervisorId: z.string().optional(),
});

export const supervisorResponseSchema = z.object({
  supervisorResponseNote: z.string().optional(),
});

export const supervisorRejectSchema = z.object({
  supervisorResponseNote: z.string().min(3, 'Cần nhập lý do từ chối'),
});

export const facultyAssignSupervisorSchema = z.object({
  supervisorId: z.string().uuid('Cần chọn GVHD'),
});

export const facultyRejectRegistrationSchema = z.object({
  rejectedReason: z.string().min(3, 'Cần nhập lý do từ chối'),
});
