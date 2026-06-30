import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một role'),
  studentProfile: z
    .object({
      studentCode: z.string().optional(),
      className: z.string().optional(),
      major: z.string().optional(),
      facultyId: z.string().optional(),
      projectPeriodId: z.string().optional(),
      internshipStatus: z.enum(['NOT_COMPLETED', 'COMPLETED', 'WAIVED']).optional(),
      academicStatus: z.enum(['ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED']).optional(),
      completedCredits: z.coerce.number().optional(),
      requiredCredits: z.coerce.number().optional(),
      gpa: z.coerce.number().optional(),
      hasPrerequisiteDebt: z.boolean().optional(),
      hasTuitionDebt: z.boolean().optional(),
      hasDisciplinaryAction: z.boolean().optional(),
      reason: z.string().optional(),
    })
    .optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
