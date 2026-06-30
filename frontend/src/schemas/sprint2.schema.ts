import { z } from 'zod';

export const projectPeriodSchema = z
  .object({
    name: z.string().min(1, 'Tên đợt đồ án bắt buộc'),
    academicYear: z.string().min(1, 'Năm học bắt buộc'),
    semester: z.string().min(1, 'Học kỳ bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc bắt buộc'),
    registrationStartDate: z.string().optional(),
    registrationEndDate: z.string().optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Ngày bắt đầu không được sau ngày kết thúc',
    path: ['endDate'],
  })
  .refine(
    (data) =>
      !data.registrationStartDate ||
      !data.registrationEndDate ||
      new Date(data.registrationStartDate) <= new Date(data.registrationEndDate),
    {
      message: 'Ngày bắt đầu đăng ký không được sau ngày kết thúc đăng ký',
      path: ['registrationEndDate'],
    },
  );

export const studentEligibilitySchema = z.object({
  studentId: z.string().uuid('studentId phải là UUID'),
  projectPeriodId: z.string().uuid('projectPeriodId phải là UUID'),
  internshipStatus: z.enum(['NOT_COMPLETED', 'COMPLETED', 'WAIVED']),
  academicStatus: z.enum(['ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED']).default('ACTIVE'),
  completedCredits: z.coerce.number().min(0, 'Tín chỉ đã tích lũy không được âm'),
  requiredCredits: z.coerce.number().min(0, 'Tín chỉ yêu cầu không được âm'),
  gpa: z.coerce.number().min(0, 'GPA/CPA không được âm').max(4, 'GPA/CPA tối đa là 4'),
  hasPrerequisiteDebt: z.boolean().default(false),
  hasTuitionDebt: z.boolean().default(false),
  hasDisciplinaryAction: z.boolean().default(false),
  eligibilityStatus: z.preprocess((value) => (value === '' ? undefined : value), z.enum(['PENDING', 'ELIGIBLE', 'NOT_ELIGIBLE']).optional()),
  reason: z.string().optional(),
});

export const topicSchema = z.object({
  title: z.string().min(1, 'Tên đề tài bắt buộc'),
  description: z.string().min(1, 'Mô tả đề tài bắt buộc'),
  objectives: z.string().optional(),
  expectedOutput: z.string().optional(),
  major: z.string().optional(),
  maxStudents: z.coerce.number().min(1, 'Số lượng sinh viên phải từ 1 trở lên'),
  projectPeriodId: z.string().uuid('projectPeriodId phải là UUID'),
});

export const rejectTopicSchema = z.object({
  rejectionReason: z.string().min(1, 'Lý do từ chối bắt buộc'),
});
