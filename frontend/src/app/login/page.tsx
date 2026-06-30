'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, GraduationCap, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiClientError } from '@/lib/api-client';
import { setAccessToken, setStoredUser } from '@/lib/auth-storage';
import { login } from '@/services/auth.service';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';

const demoAccounts = [
  'admin@example.com / Admin@123456',
  'student@example.com / Student@123456',
  'supervisor@example.com / Supervisor@123456',
  'faculty@example.com / Faculty@123456',
  'reviewer@example.com / Reviewer@123456',
  'secretary@example.com / Secretary@123456',
  'archive@example.com / Archive@123456',
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123456',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      const result = await login(values);
      setAccessToken(result.accessToken);
      setStoredUser(result.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Không thể đăng nhập, vui lòng thử lại');
    }
  }

  return (
    <>
      <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.25),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-white p-3 text-slate-950 shadow-xl"><GraduationCap className="h-8 w-8" /></div>
              <div>
                <p className="text-xl font-bold">Quản lý đồ án tốt nghiệp</p>
                <p className="text-sm text-slate-300">Dashboard học vụ thống nhất</p>
              </div>
            </div>
            <div className="max-w-2xl">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15">SAD25-26 · Nhóm 08</span>
              <h1 className="mt-6 text-5xl font-black leading-tight">Theo dõi toàn bộ vòng đời đồ án trong một hệ thống.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">Từ xét điều kiện, đăng ký đề tài, nộp đề cương, bảo vệ, chấm điểm, chỉnh sửa sau bảo vệ đến lưu trữ và khóa hồ sơ.</p>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15"><ShieldCheck className="mb-3 h-6 w-6" /><p className="font-semibold">RBAC theo vai trò</p><p className="mt-1 text-sm text-slate-300">Menu và API theo đúng quyền người dùng.</p></div>
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15"><LockKeyhole className="mb-3 h-6 w-6" /><p className="font-semibold">Không chọn role khi login</p><p className="mt-1 text-sm text-slate-300">Vai trò lấy từ tài khoản và token.</p></div>
              </div>
            </div>
            <p className="text-sm text-slate-400">Graduation Project Management System · MVP</p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-300/60">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white lg:hidden"><GraduationCap className="h-7 w-7" /></div>
              <h1 className="text-2xl font-bold text-slate-950">Đăng nhập hệ thống</h1>
              <p className="mt-2 text-sm text-slate-500">Nhập email và mật khẩu. Hệ thống tự nhận diện vai trò.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950" {...form.register('email')} />
                {form.formState.errors.email && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                <div className="mt-2 flex rounded-xl border border-slate-200 bg-white focus-within:border-slate-950">
                  <input type={showPassword ? 'text' : 'password'} className="min-w-0 flex-1 rounded-xl px-4 py-3 outline-none" {...form.register('password')} />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="px-3 text-slate-500 hover:text-slate-900">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.password && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.password.message}</p>}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded" />
                Ghi nhớ đăng nhập trên thiết bị này
              </label>

              {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

              <button type="submit" disabled={form.formState.isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Đăng nhập
              </button>
            </form>

            <details className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-800">Tài khoản demo</summary>
              <div className="mt-3 space-y-1">
                {demoAccounts.map((account) => <p key={account}>{account}</p>)}
              </div>
            </details>
          </div>
        </section>
      </div>
    </>
  );
}
