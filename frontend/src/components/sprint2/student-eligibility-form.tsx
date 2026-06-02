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
      eligibilityStatus: 'ELIGIBLE',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Thêm sinh viên đủ điều kiện</h2>
        <p className="text-sm text-slate-500">Sprint 2 dùng UUID sinh viên và UUID đợt đồ án. Seed demo đã có sẵn một bản ghi.</p>
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
        Eligibility Status
        <select {...register('eligibilityStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="ELIGIBLE">ELIGIBLE</option>
          <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
          <option value="PENDING">PENDING</option>
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Lý do nếu chưa đủ điều kiện
        <textarea {...register('reason')} className="w-full rounded-xl border px-3 py-2" rows={3} />
      </label>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
        {loading ? 'Đang lưu...' : 'Thêm vào danh sách'}
      </button>
    </form>
  );
}
