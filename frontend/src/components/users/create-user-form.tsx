'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FacultySelect, ProjectPeriodSelect, RoleMultiSelect } from '@/components/common/selects';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user.schema';
import type { Role } from '@/types/auth';

type Props = {
  roles: Role[];
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
};

const defaultStudentProfile = {
  studentCode: '',
  className: '',
  major: 'Software Engineering',
  facultyId: '',
  projectPeriodId: '',
  internshipStatus: 'COMPLETED' as const,
  academicStatus: 'ACTIVE' as const,
  completedCredits: 110,
  requiredCredits: 110,
  gpa: 2.5,
  hasPrerequisiteDebt: false,
  hasTuitionDebt: false,
  hasDisciplinaryAction: false,
  reason: '',
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
      studentProfile: defaultStudentProfile,
    },
  });

  const selectedRoleIds = form.watch('roleIds') ?? [];
  const studentRole = roles.find((role) => role.code === 'STUDENT');
  const isStudentRoleSelected = Boolean(studentRole && selectedRoleIds.includes(studentRole.id));

  function validateStudentProfile(values: CreateUserFormValues) {
    if (!isStudentRoleSelected) return true;
    const profile = values.studentProfile;
    let valid = true;

    if (!profile?.studentCode?.trim()) {
      form.setError('studentProfile.studentCode', { message: 'Vui lòng nhập mã sinh viên.' });
      valid = false;
    }
    if (!profile?.className?.trim()) {
      form.setError('studentProfile.className', { message: 'Vui lòng nhập lớp.' });
      valid = false;
    }
    if (!profile?.major?.trim()) {
      form.setError('studentProfile.major', { message: 'Vui lòng nhập ngành.' });
      valid = false;
    }
    if (!profile?.projectPeriodId?.trim()) {
      form.setError('studentProfile.projectPeriodId', { message: 'Vui lòng chọn đợt đồ án để tạo bản ghi xét điều kiện.' });
      valid = false;
    }
    if (profile?.completedCredits === undefined || Number.isNaN(profile.completedCredits)) {
      form.setError('studentProfile.completedCredits', { message: 'Vui lòng nhập số tín chỉ đã tích lũy.' });
      valid = false;
    }
    if (profile?.requiredCredits === undefined || Number.isNaN(profile.requiredCredits)) {
      form.setError('studentProfile.requiredCredits', { message: 'Vui lòng nhập số tín chỉ yêu cầu.' });
      valid = false;
    }
    if (profile?.gpa === undefined || Number.isNaN(profile.gpa)) {
      form.setError('studentProfile.gpa', { message: 'Vui lòng nhập GPA/CPA.' });
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(values: CreateUserFormValues) {
    if (!validateStudentProfile(values)) return;

    const payload: CreateUserFormValues = isStudentRoleSelected
      ? {
          ...values,
          studentProfile: {
            ...defaultStudentProfile,
            ...values.studentProfile,
            facultyId: values.studentProfile?.facultyId?.trim() || undefined,
            reason: values.studentProfile?.reason?.trim() || undefined,
          },
        }
      : { ...values, studentProfile: undefined };

    await onSubmit(payload);
    form.reset({ email: '', fullName: '', password: 'Password@123', phone: '', roleIds: [], studentProfile: defaultStudentProfile });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Tạo người dùng</h2>
      <p className="mt-1 text-sm text-slate-500">
        Khi chọn role STUDENT, Admin nhập thủ công hồ sơ sinh viên. Các ID nội bộ được chọn qua dropdown và gửi ẩn về backend.
      </p>

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
        <RoleMultiSelect
          roles={roles}
          value={selectedRoleIds}
          onChange={(value) => form.setValue('roleIds', value, { shouldValidate: true })}
          error={form.formState.errors.roleIds?.message}
        />
      </div>

      {isStudentRoleSelected && (
        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
          <h3 className="text-lg font-bold text-slate-950">Hồ sơ sinh viên và dữ liệu xét điều kiện</h3>
          <p className="mt-1 text-sm text-slate-600">
            Các thông tin học vụ là dữ liệu nhập thủ công/phụ trợ. Điều kiện chính của hệ thống vẫn là trạng thái thực tập và xác nhận của Khoa.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Mã sinh viên
              <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.studentCode')} />
              {form.formState.errors.studentProfile?.studentCode && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.studentCode.message}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Lớp
              <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.className')} />
              {form.formState.errors.studentProfile?.className && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.className.message}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Ngành
              <input className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.major')} />
              {form.formState.errors.studentProfile?.major && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.major.message}</p>}
            </label>
            <ProjectPeriodSelect
              className="md:col-span-2"
              status="OPEN"
              value={form.watch('studentProfile.projectPeriodId')}
              onChange={(value) => form.setValue('studentProfile.projectPeriodId', value, { shouldValidate: true })}
              error={form.formState.errors.studentProfile?.projectPeriodId?.message}
            />
            <FacultySelect
              optional
              value={form.watch('studentProfile.facultyId')}
              onChange={(value) => form.setValue('studentProfile.facultyId', value)}
            />
            <label className="text-sm font-medium text-slate-700">
              Trạng thái thực tập
              <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.internshipStatus')}>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="WAIVED">Được miễn</option>
                <option value="NOT_COMPLETED">Chưa hoàn thành</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Trạng thái học vụ
              <select className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.academicStatus')}>
                <option value="ACTIVE">Đang học</option>
                <option value="SUSPENDED">Tạm đình chỉ</option>
                <option value="GRADUATED">Đã tốt nghiệp</option>
                <option value="DROPPED">Thôi học</option>
              </select>
            </label>
          </div>

          <details className="mt-4 rounded-2xl border border-blue-100 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-blue-800">Thông tin bổ sung/Advanced</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">
                Tín chỉ đã tích lũy
                <input type="number" className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.completedCredits', { valueAsNumber: true })} />
                {form.formState.errors.studentProfile?.completedCredits && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.completedCredits.message}</p>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Tín chỉ yêu cầu
                <input type="number" className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.requiredCredits', { valueAsNumber: true })} />
                {form.formState.errors.studentProfile?.requiredCredits && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.requiredCredits.message}</p>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                GPA/CPA
                <input type="number" step="0.01" className="mt-2 w-full rounded-xl border px-3 py-2" {...form.register('studentProfile.gpa', { valueAsNumber: true })} />
                {form.formState.errors.studentProfile?.gpa && <p className="mt-1 text-xs text-rose-600">{form.formState.errors.studentProfile.gpa.message}</p>}
              </label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
                <input type="checkbox" {...form.register('studentProfile.hasPrerequisiteDebt')} />
                Còn nợ môn tiên quyết
              </label>
              <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
                <input type="checkbox" {...form.register('studentProfile.hasTuitionDebt')} />
                Còn nợ học phí
              </label>
              <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
                <input type="checkbox" {...form.register('studentProfile.hasDisciplinaryAction')} />
                Có tình trạng kỷ luật
              </label>
            </div>
          </details>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Ghi chú xét điều kiện
            <textarea className="mt-2 w-full rounded-xl border px-3 py-2" rows={3} {...form.register('studentProfile.reason')} />
          </label>
        </div>
      )}

      <button disabled={form.formState.isSubmitting} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Tạo user
      </button>
    </form>
  );
}
