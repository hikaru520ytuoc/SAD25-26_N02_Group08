'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FacultySelect, MajorSelect, RoleMultiSelect } from '@/components/common/selects';
import { updateUserSchema, type UpdateUserFormValues } from '@/schemas/user.schema';
import type { LookupOption } from '@/services/lookups.service';
import type { Role, UserListItem } from '@/types/auth';

type Props = {
  open: boolean;
  user: UserListItem | null;
  roles: Role[];
  onClose: () => void;
  onSubmit: (userId: string, values: UpdateUserFormValues) => Promise<void>;
};

const emptyProfile = {
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

export function EditUserDialog({ open, user, roles, onClose, onSubmit }: Props) {
  const [submitError, setSubmitError] = useState('');
  const [majorTotalCredits, setMajorTotalCredits] = useState<number | null>(null);
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { email: '', fullName: '', phone: '', password: '', roleIds: [], studentProfile: emptyProfile },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? '',
      password: '',
      roleIds: user.roles.map((role) => role.id),
      studentProfile: user.student
        ? {
            studentCode: user.student.studentCode,
            className: user.student.className,
            majorId: user.student.majorId,
            facultyId: user.student.facultyId ?? '',
            internshipStatus: user.student.internshipStatus,
            academicStatus: user.student.academicStatus,
            accumulatedCredits: user.student.accumulatedCredits,
            gpa: user.student.gpa,
            hasPrerequisiteDebt: user.student.hasPrerequisiteDebt,
            hasTuitionDebt: user.student.hasTuitionDebt,
            hasDisciplinaryAction: user.student.hasDisciplinaryAction,
          }
        : emptyProfile,
    });
    setMajorTotalCredits(user.student?.major.totalCredits ?? null);
    setSubmitError('');
  }, [form, user]);

  const studentRoleId = useMemo(() => roles.find((role) => role.code === 'STUDENT')?.id, [roles]);
  const isStudent = Boolean(studentRoleId && form.watch('roleIds').includes(studentRoleId));
  const requiredCredits = majorTotalCredits ? Math.ceil(majorTotalCredits * 0.8) : null;

  if (!open || !user) return null;
  const currentUser = user;

  function validateStudent(values: UpdateUserFormValues) {
    if (!isStudent) return true;
    const profile = values.studentProfile;
    let valid = true;
    if (!profile?.studentCode?.trim()) { form.setError('studentProfile.studentCode', { message: 'Vui lòng nhập mã sinh viên.' }); valid = false; }
    if (!profile?.className?.trim()) { form.setError('studentProfile.className', { message: 'Vui lòng nhập lớp.' }); valid = false; }
    if (!profile?.majorId?.trim()) { form.setError('studentProfile.majorId', { message: 'Vui lòng chọn ngành học.' }); valid = false; }
    if (profile?.accumulatedCredits === undefined || Number.isNaN(profile.accumulatedCredits)) { form.setError('studentProfile.accumulatedCredits', { message: 'Vui lòng nhập tín chỉ tích lũy.' }); valid = false; }
    if (profile?.gpa === undefined || Number.isNaN(profile.gpa)) { form.setError('studentProfile.gpa', { message: 'Vui lòng nhập GPA.' }); valid = false; }
    return valid;
  }

  async function handleSubmit(values: UpdateUserFormValues) {
    if (!validateStudent(values)) return;
    try {
      setSubmitError('');
      await onSubmit(currentUser.id, {
        ...values,
        phone: values.phone?.trim() || undefined,
        password: values.password?.trim() || undefined,
        studentProfile: isStudent
          ? { ...emptyProfile, ...values.studentProfile, facultyId: values.studentProfile?.facultyId?.trim() || undefined }
          : undefined,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể cập nhật tài khoản');
    }
  }

  function handleMajorChange(value: string, option?: LookupOption) {
    form.setValue('studentProfile.majorId', value, { shouldValidate: true, shouldDirty: true });
    const total = option?.meta?.totalCredits;
    setMajorTotalCredits(typeof total === 'number' ? total : null);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div><h2 className="text-xl font-bold text-slate-950">Sửa tài khoản</h2><p className="mt-1 text-sm text-slate-500">Cập nhật tài khoản, vai trò và hồ sơ sinh viên. Không gán đợt đồ án tại đây.</p></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Họ và tên
              <input className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('fullName')} />
              {form.formState.errors.fullName && <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.fullName.message}</span>}
            </label>
            <label className="text-sm font-medium text-slate-700">Email
              <input type="email" className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('email')} />
              {form.formState.errors.email && <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.email.message}</span>}
            </label>
            <label className="text-sm font-medium text-slate-700">Số điện thoại
              <input className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('phone')} />
            </label>
            <label className="text-sm font-medium text-slate-700">Mật khẩu mới
              <input type="password" autoComplete="new-password" placeholder="Để trống nếu không đổi" className="mt-2 w-full rounded-xl border px-4 py-3" {...form.register('password')} />
            </label>
          </div>

          <RoleMultiSelect roles={roles} value={form.watch('roleIds')} onChange={(value) => form.setValue('roleIds', value, { shouldValidate: true, shouldDirty: true })} error={form.formState.errors.roleIds?.message} />

          {isStudent && (
            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
              <h3 className="text-lg font-bold text-slate-950">Hồ sơ sinh viên và dữ liệu học vụ</h3>
              <p className="mt-1 text-sm text-slate-600">Điều kiện được tính tự động: tín chỉ đạt ít nhất 80% tổng tín chỉ ngành, GPA từ 2,5 và các điều kiện logic đều đạt.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">Mã sinh viên
                  <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.studentCode')} />
                  {form.formState.errors.studentProfile?.studentCode && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.studentCode.message}</p>}
                </label>
                <label className="text-sm font-medium text-slate-700">Lớp
                  <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.className')} />
                </label>
                <MajorSelect value={form.watch('studentProfile.majorId')} onChange={handleMajorChange} error={form.formState.errors.studentProfile?.majorId?.message} />
                <FacultySelect optional value={form.watch('studentProfile.facultyId')} onChange={(value) => form.setValue('studentProfile.facultyId', value)} />
                <label className="text-sm font-medium text-slate-700">Tổng tín chỉ tích lũy
                  <input type="number" min={0} className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.accumulatedCredits', { valueAsNumber: true })} />
                </label>
                <label className="text-sm font-medium text-slate-700">GPA/CPA
                  <input type="number" min={0} max={4} step="0.01" className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.gpa', { valueAsNumber: true })} />
                </label>
                <label className="text-sm font-medium text-slate-700">Trạng thái thực tập
                  <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.internshipStatus')}><option value="COMPLETED">Đã hoàn thành</option><option value="WAIVED">Được miễn</option><option value="NOT_COMPLETED">Chưa hoàn thành</option></select>
                </label>
                <label className="text-sm font-medium text-slate-700">Trạng thái học vụ
                  <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.academicStatus')}><option value="ACTIVE">Đang học</option><option value="SUSPENDED">Tạm đình chỉ</option><option value="GRADUATED">Đã tốt nghiệp</option><option value="DROPPED">Thôi học</option></select>
                </label>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasPrerequisiteDebt')} /> Còn nợ môn tiên quyết</label>
                <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasTuitionDebt')} /> Còn nợ học phí</label>
                <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"><input type="checkbox" {...form.register('studentProfile.hasDisciplinaryAction')} /> Có tình trạng kỷ luật</label>
              </div>
              {requiredCredits !== null && <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4 text-sm font-semibold text-slate-800">Tổng tín chỉ ngành: {majorTotalCredits} · Ngưỡng 80%: {requiredCredits} tín chỉ</div>}
            </div>
          )}

          {submitError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{submitError}</div>}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Hủy</button>
            <button disabled={form.formState.isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
