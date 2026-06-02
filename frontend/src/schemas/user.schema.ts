import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một role'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
