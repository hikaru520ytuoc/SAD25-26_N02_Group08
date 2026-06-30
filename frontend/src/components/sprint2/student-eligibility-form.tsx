'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { studentEligibilitySchema } from '@/schemas/sprint2.schema';
import type { CreateStudentEligibilityInput } from '@/services/student-eligibilities.service';

type FormValues = z.infer<typeof studentEligibilitySchema>;

type Props = {
  onSubmit: (input: CreateStudentEligibilityInput) => Promise<void>;
  loading?: boolean;
};

export function StudentEligibilityForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(studentEligibilitySchema),
    defaultValues: {
      internshipStatus: 'COMPLETED',
      academicStatus: 'ACTIVE',
      completedCredits: 110,
      requiredCredits: 110,
      gpa: 2.5,
      hasPrerequisiteDebt: false,
      hasTuitionDebt: false,
      hasDisciplinaryAction: false,
      eligibilityStatus: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Thêm/Xét điều kiện sinh viên</h2>
        <p className="text-sm text-slate-500">
          Nhập thủ công dữ liệu học vụ. Hệ thống tự đánh giá điều kiện dựa trên thực tập, học vụ, tín chỉ, GPA/CPA, nợ môn, nợ học phí và kỷ luật.
        </p>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Student ID
        <input {...register('studentId')} className="w-full rounded-xl border px-3 py-2" placeholder="UUID sinh viên" />
        {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Project Period ID
        <input {...register('projectPeriodId')} className="w-full rounded-xl border px-3 py-2" placeholder="UUID đợt đồ án" />
        {errors.projectPeriodId && <p className="text-xs text-red-600">{errors.projectPeriodId.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Internship Status
        <select {...register('internshipStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="COMPLETED">COMPLETED</option>
          <option value="WAIVED">WAIVED</option>
          <option value="NOT_COMPLETED">NOT_COMPLETED</option>
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Academic Status
        <select {...register('academicStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="GRADUATED">GRADUATED</option>
          <option value="DROPPED">DROPPED</option>
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Số tín chỉ đã tích lũy
        <input type="number" {...register('completedCredits', { valueAsNumber: true })} className="w-full rounded-xl border px-3 py-2" />
        {errors.completedCredits && <p className="text-xs text-red-600">{errors.completedCredits.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Số tín chỉ yêu cầu
        <input type="number" {...register('requiredCredits', { valueAsNumber: true })} className="w-full rounded-xl border px-3 py-2" />
        {errors.requiredCredits && <p className="text-xs text-red-600">{errors.requiredCredits.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        GPA/CPA
        <input type="number" step="0.01" {...register('gpa', { valueAsNumber: true })} className="w-full rounded-xl border px-3 py-2" />
        {errors.gpa && <p className="text-xs text-red-600">{errors.gpa.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Trạng thái muốn ghi nhận
        <select {...register('eligibilityStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="">Tự động theo điều kiện</option>
          <option value="ELIGIBLE">ELIGIBLE</option>
          <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
          <option value="PENDING">PENDING</option>
        </select>
      </label>
      <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input type="checkbox" {...register('hasPrerequisiteDebt')} />
          Còn nợ môn tiên quyết
        </label>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input type="checkbox" {...register('hasTuitionDebt')} />
          Còn nợ học phí
        </label>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input type="checkbox" {...register('hasDisciplinaryAction')} />
          Có tình trạng kỷ luật
        </label>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Lý do/Ghi chú xét điều kiện
        <textarea {...register('reason')} className="w-full rounded-xl border px-3 py-2" rows={3} />
      </label>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
        {loading ? 'Đang lưu...' : 'Thêm vào danh sách'}
      </button>
    </form>
  );
}
