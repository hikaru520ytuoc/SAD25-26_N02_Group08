'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user.schema';
import type { Role } from '@/types/auth';

type Props = {
  roles: Role[];
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
};

export function CreateUserForm({ roles, onSubmit }: Props) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: 'Password@123',
      phone: '',
      roleIds: [],
    },
  });

  async function handleSubmit(values: CreateUserFormValues) {
    await onSubmit(values);
    form.reset({ email: '', fullName: '', password: 'Password@123', phone: '', roleIds: [] });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Tạo người dùng</h2>
      <p className="mt-1 text-sm text-slate-500">Chỉ ADMIN được tạo tài khoản trong Sprint 1.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950" {...form.register('email')} />
          {form.formState.errors.email && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Họ tên</label>
          <input className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950" {...form.register('fullName')} />
          {form.formState.errors.fullName && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.fullName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <input type="password" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950" {...form.register('password')} />
          {form.formState.errors.password && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.password.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <input className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950" {...form.register('phone')} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-700">Role</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input type="checkbox" value={role.id} {...form.register('roleIds')} />
              <span>{role.code}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.roleIds && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.roleIds.message}</p>}
      </div>

      <button disabled={form.formState.isSubmitting} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Tạo user
      </button>
    </form>
  );
}
