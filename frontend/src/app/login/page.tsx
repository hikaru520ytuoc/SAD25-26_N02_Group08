'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppShell } from '@/components/layout/app-shell';
import { ApiClientError } from '@/lib/api-client';
import { setAccessToken, setStoredUser } from '@/lib/auth-storage';
import { login } from '@/services/auth.service';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Không thể đăng nhập, vui lòng thử lại');
      }
    }
  }

  return (
    <AppShell>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Đăng nhập</h1>
              <p className="text-sm text-slate-500">Sprint 1 · Auth + User + Role</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-rose-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-rose-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Tài khoản demo:</p>
            <p>admin@example.com / Admin@123456</p>
            <p>student@example.com / Student@123456</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
