'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FacultySelect, MajorSelect, RoleMultiSelect } from '@/components/common/selects';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user.schema';
import type { LookupOption } from '@/services/lookups.service';
import type { Role } from '@/types/auth';

type Props = { roles: Role[]; onSubmit: (values: CreateUserFormValues) => Promise<void> };

const defaultStudentProfile = {
  studentCode: '',
  className: '',
  majorId: '',
  facultyId: '',
  internshipStatus: 'NOT_COMPLETED' as const,
  academicStatus: 'ACTIVE' as const,
  hasPrerequisiteDebt: false,
  hasTuitionDebt: false,
  hasDisciplinaryAction: false,
};

export function CreateUserForm({ roles, onSubmit }: Props) {
  const [majorTotalCredits, setMajorTotalCredits] = useState<number | null>(null);
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', fullName: '', password: 'Password@123', phone: '', roleIds: [], studentProfile: defaultStudentProfile },
  });

  const selectedRoleIds = form.watch('roleIds') ?? [];
  const studentRole = roles.find((role) => role.code === 'STUDENT');
  const isStudent = Boolean(studentRole && selectedRoleIds.includes(studentRole.id));
  const accumulatedCredits = form.watch('studentProfile.accumulatedCredits') ?? 0;
  const gpa = form.watch('studentProfile.gpa') ?? 0;
  const requiredCredits = majorTotalCredits ? Math.ceil(majorTotalCredits * 0.8) : null;

  function validateStudent(values: CreateUserFormValues) {
    if (!isStudent) return true;
    const profile = values.studentProfile;
    let valid = true;
    const requiredText: Array<[keyof NonNullable<CreateUserFormValues['studentProfile']>, unknown, string]> = [
      ['studentCode', profile?.studentCode?.trim(), 'Vui lòng nhập mã sinh viên.'],
      ['className', profile?.className?.trim(), 'Vui lòng nhập lớp.'],
      ['majorId', profile?.majorId?.trim(), 'Vui lòng chọn ngành học.'],
    ];
    requiredText.forEach(([key, value, message]) => {
      if (!value) { form.setError(`studentProfile.${key}` as any, { message }); valid = false; }
    });
    if (profile?.accumulatedCredits === undefined || Number.isNaN(profile.accumulatedCredits)) {
      form.setError('studentProfile.accumulatedCredits', { message: 'Vui lòng nhập tổng tín chỉ tích lũy.' }); valid = false;
    }
    if (profile?.gpa === undefined || Number.isNaN(profile.gpa)) {
      form.setError('studentProfile.gpa', { message: 'Vui lòng nhập GPA/CPA.' }); valid = false;
    }
    return valid;
  }

  async function handleSubmit(values: CreateUserFormValues) {
    if (!validateStudent(values)) return;
    const payload: CreateUserFormValues = isStudent
      ? { ...values, studentProfile: { ...defaultStudentProfile, ...values.studentProfile, facultyId: values.studentProfile?.facultyId?.trim() || undefined } }
      : { ...values, studentProfile: undefined };
    await onSubmit(payload);
    form.reset({ email: '', fullName: '', password: 'Password@123', phone: '', roleIds: [], studentProfile: defaultStudentProfile });
    setMajorTotalCredits(null);
  }

  function handleMajorChange(value: string, option?: LookupOption) {
    form.setValue('studentProfile.majorId', value, { shouldValidate: true, shouldDirty: true });
    const total = option?.meta?.totalCredits;
    setMajorTotalCredits(typeof total === 'number' ? total : null);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Tạo người dùng</h2>
      <p className="mt-1 text-sm text-slate-500">Chỉ ADMIN tạo tài khoản. Tài khoản sinh viên lưu hồ sơ học vụ, không bị gán vào đợt đồ án.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Email
          <input className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('email')} />
          {form.formState.errors.email && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.email.message}</p>}
        </label>
        <label className="text-sm font-medium text-slate-700">Họ tên
          <input className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('fullName')} />
          {form.formState.errors.fullName && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.fullName.message}</p>}
        </label>
        <label className="text-sm font-medium text-slate-700">Mật khẩu
          <input type="password" className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('password')} />
          {form.formState.errors.password && <p className="mt-1 text-sm text-rose-600">{form.formState.errors.password.message}</p>}
        </label>
        <label className="text-sm font-medium text-slate-700">Số điện thoại
          <input className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('phone')} />
        </label>
      </div>

      <div className="mt-5">
        <RoleMultiSelect roles={roles} value={selectedRoleIds} onChange={(value) => form.setValue('roleIds', value, { shouldValidate: true })} error={form.formState.errors.roleIds?.message} />
      </div>

      {isStudent && (
        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
          <h3 className="text-lg font-bold text-slate-950">Hồ sơ sinh viên và dữ liệu học vụ</h3>
          <p className="mt-1 text-sm text-slate-600">Hệ thống tự tính ngưỡng tín chỉ bằng 80% tổng tín chỉ ngành và GPA tối thiểu 2,5. Không chọn đợt đồ án tại đây.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">Mã sinh viên
              <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.studentCode')} />
              {form.formState.errors.studentProfile?.studentCode && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.studentCode.message}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">Lớp
              <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.className')} />
              {form.formState.errors.studentProfile?.className && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.className.message}</p>}
            </label>
            <MajorSelect value={form.watch('studentProfile.majorId')} onChange={handleMajorChange} error={form.formState.errors.studentProfile?.majorId?.message} />
            <FacultySelect optional value={form.watch('studentProfile.facultyId')} onChange={(value) => form.setValue('studentProfile.facultyId', value)} />
            <label className="text-sm font-medium text-slate-700">Tổng tín chỉ tích lũy
              <input type="number" min={0} className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.accumulatedCredits', { valueAsNumber: true })} />
              {form.formState.errors.studentProfile?.accumulatedCredits && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.accumulatedCredits.message}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">GPA/CPA
              <input type="number" min={0} max={4} step="0.01" className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.gpa', { valueAsNumber: true })} />
              {form.formState.errors.studentProfile?.gpa && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.gpa.message}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">Trạng thái thực tập
              <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.internshipStatus')}>
                <option value="COMPLETED">Đã hoàn thành</option><option value="WAIVED">Được miễn</option><option value="NOT_COMPLETED">Chưa hoàn thành</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Trạng thái học vụ
              <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.academicStatus')}>
                <option value="ACTIVE">Đang học</option><option value="SUSPENDED">Tạm đình chỉ</option><option value="GRADUATED">Đã tốt nghiệp</option><option value="DROPPED">Thôi học</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasPrerequisiteDebt')} /> Còn nợ môn tiên quyết</label>
            <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasTuitionDebt')} /> Còn nợ học phí</label>
            <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasDisciplinaryAction')} /> Có tình trạng kỷ luật</label>
          </div>

          {requiredCredits !== null && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4 text-sm">
              <p className="font-semibold text-slate-900">Tổng tín chỉ ngành: {majorTotalCredits} · Ngưỡng 80%: {requiredCredits} tín chỉ</p>
              <p className="mt-1 text-slate-600">Tín chỉ hiện tại: {accumulatedCredits}/{requiredCredits} · GPA: {gpa}/2,5</p>
            </div>
          )}
        </div>
      )}

      <button disabled={form.formState.isSubmitting} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tạo tài khoản
      </button>
    </form>
  );
}
