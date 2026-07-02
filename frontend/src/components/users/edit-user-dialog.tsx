'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RoleMultiSelect } from '@/components/common/selects';
import { updateUserSchema, type UpdateUserFormValues } from '@/schemas/user.schema';
import type { Role, UserListItem } from '@/types/auth';

type Props = {
  open: boolean;
  user: UserListItem | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (userId: string, values: UpdateUserFormValues) => Promise<void>;
};

export function EditUserDialog({ open, user, roles, onClose, onSubmit }: Props) {
  const [submitError, setSubmitError] = useState('');
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { email: '', fullName: '', phone: '', password: '', roleIds: [] },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? '',
      password: '',
      roleIds: user.roles.map((role) => role.id),
    });
    setSubmitError('');
  }, [form, user]);

  if (!open || !user) return null;

  const selectedUser = user;

  async function handleSubmit(values: UpdateUserFormValues) {
    try {
      setSubmitError('');
      await onSubmit(selectedUser.id, {
        ...values,
        phone: values.phone?.trim() || undefined,
        password: values.password?.trim() || undefined,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể cập nhật tài khoản');
    }
  }

  const profileLabel = selectedUser.student
    ? `${selectedUser.student.studentCode} · ${selectedUser.student.className} · ${selectedUser.student.major}`
    : selectedUser.lecturer
      ? `${selectedUser.lecturer.lecturerCode}${selectedUser.lecturer.department ? ` · ${selectedUser.lecturer.department}` : ''}`
      : 'Tài khoản chưa có hồ sơ sinh viên/giảng viên.';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Sửa tài khoản</h2>
            <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin đăng nhập và vai trò. Trạng thái khóa được quản lý riêng ở danh sách.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Hồ sơ liên kết</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{profileLabel}</p>
            <p className="mt-1 text-xs text-slate-500">Dữ liệu học vụ chi tiết được chỉnh ở màn hình nghiệp vụ tương ứng.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Họ và tên <span className="text-rose-600">*</span>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" {...form.register('fullName')} />
              {form.formState.errors.fullName ? <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.fullName.message}</span> : null}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email <span className="text-rose-600">*</span>
              <input type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" {...form.register('email')} />
              {form.formState.errors.email ? <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.email.message}</span> : null}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Số điện thoại
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" {...form.register('phone')} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Mật khẩu mới
              <input type="password" autoComplete="new-password" placeholder="Để trống nếu không đổi" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" {...form.register('password')} />
              {form.formState.errors.password ? <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.password.message}</span> : null}
            </label>
          </div>

          <RoleMultiSelect
            roles={roles}
            value={form.watch('roleIds')}
            onChange={(value) => form.setValue('roleIds', value, { shouldValidate: true, shouldDirty: true })}
            error={form.formState.errors.roleIds?.message}
          />

          {submitError ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{submitError}</div> : null}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Hủy
            </button>
            <button disabled={form.formState.isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
