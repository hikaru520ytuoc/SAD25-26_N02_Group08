import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
