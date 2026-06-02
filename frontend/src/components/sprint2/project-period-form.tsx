'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { projectPeriodSchema } from '@/schemas/sprint2.schema';
import type { ProjectPeriodInput } from '@/services/project-periods.service';

type FormValues = z.infer<typeof projectPeriodSchema>;

type Props = {
  onSubmit: (input: ProjectPeriodInput) => Promise<void>;
  loading?: boolean;
};

export function ProjectPeriodForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(projectPeriodSchema),
    defaultValues: {
      name: 'Đợt đồ án tốt nghiệp học kỳ 1 năm 2025-2026',
      academicYear: '2025-2026',
      semester: 'HK1',
      startDate: '2025-09-01',
      endDate: '2026-01-15',
      registrationStartDate: '2025-09-05',
      registrationEndDate: '2025-09-30',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset(values);
      })}
      className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Tạo đợt đồ án</h2>
        <p className="text-sm text-slate-500">Chỉ Faculty Manager/Admin được tạo đợt đồ án.</p>
      </div>
      {(
        [
          ['name', 'Tên đợt'],
          ['academicYear', 'Năm học'],
          ['semester', 'Học kỳ'],
          ['startDate', 'Ngày bắt đầu'],
          ['endDate', 'Ngày kết thúc'],
          ['registrationStartDate', 'Ngày bắt đầu đăng ký'],
          ['registrationEndDate', 'Ngày kết thúc đăng ký'],
        ] as Array<[keyof FormValues, string]>
      ).map(([field, label]) => (
        <label key={String(field)} className="space-y-1 text-sm font-medium text-slate-700">
          {label}
          <input
            type={String(field).toLowerCase().includes('date') ? 'date' : 'text'}
            {...register(field)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          {errors[field]?.message && <p className="text-xs text-red-600">{String(errors[field]?.message)}</p>}
        </label>
      ))}
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
        {loading ? 'Đang tạo...' : 'Tạo đợt đồ án'}
      </button>
    </form>
  );
}
