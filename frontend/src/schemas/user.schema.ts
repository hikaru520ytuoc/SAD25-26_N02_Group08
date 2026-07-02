import { z } from 'zod';

const studentProfileSchema = z.object({
  studentCode: z.string().optional(),
  className: z.string().optional(),
  majorId: z.string().optional(),
  facultyId: z.string().optional(),
  internshipStatus: z.enum(['NOT_COMPLETED', 'COMPLETED', 'WAIVED']).optional(),
  academicStatus: z.enum(['ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED']).optional(),
  accumulatedCredits: z.coerce.number().min(0, 'Tín chỉ tích lũy không được âm').optional(),
  gpa: z.coerce.number().min(0, 'GPA không được âm').max(4, 'GPA không được lớn hơn 4').optional(),
  hasPrerequisiteDebt: z.boolean().optional(),
  hasTuitionDebt: z.boolean().optional(),
  hasDisciplinaryAction: z.boolean().optional(),
});

export const createUserSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một role'),
  studentProfile: studentProfileSchema.optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().optional(),
  password: z.string().optional().refine((value) => !value || value.length >= 8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  roleIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một vai trò'),
  studentProfile: studentProfileSchema.optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
