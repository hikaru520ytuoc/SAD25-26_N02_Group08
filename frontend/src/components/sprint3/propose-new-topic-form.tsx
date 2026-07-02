'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SupervisorSelect } from '@/components/common/selects';
import { proposeNewTopicSchema } from '@/schemas/sprint3.schema';
import type { ProposeNewTopicInput } from '@/services/topic-registrations.service';
import type { LecturerOption } from '@/types/sprint3';

type FormValues = z.infer<typeof proposeNewTopicSchema>;

type Props = {
  supervisors: LecturerOption[];
  onSubmit: (input: ProposeNewTopicInput) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

export function ProposeNewTopicForm({ onSubmit, loading, disabled }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(proposeNewTopicSchema),
    defaultValues: {
      proposedTitle: '',
      proposedDescription: '',
      proposedObjectives: '',
      proposedExpectedOutput: '',
      proposedMajor: '',
      requestedSupervisorId: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Đề xuất đề tài mới</h2>
        <p className="text-sm text-slate-500">Đợt đồ án được tự động lấy từ đợt bạn đã đăng ký. Có thể chọn GVHD đề xuất hoặc để Khoa phân công.</p>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Tên đề tài đề xuất
        <input {...register('proposedTitle')} className="w-full rounded-xl border px-3 py-2" disabled={disabled} />
        {errors.proposedTitle && <p className="text-xs text-red-600">{errors.proposedTitle.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Mô tả
        <textarea {...register('proposedDescription')} className="w-full rounded-xl border px-3 py-2" rows={3} disabled={disabled} />
        {errors.proposedDescription && <p className="text-xs text-red-600">{errors.proposedDescription.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Ngành/lĩnh vực đề tài
        <input {...register('proposedMajor')} className="w-full rounded-xl border px-3 py-2" disabled={disabled} />
      </label>
      <SupervisorSelect
        optional
        disabled={disabled}
        value={watch('requestedSupervisorId') ?? ''}
        onChange={(value) => setValue('requestedSupervisorId', value || undefined)}
        label="GVHD đề xuất"
      />
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Mục tiêu
        <textarea {...register('proposedObjectives')} className="w-full rounded-xl border px-3 py-2" rows={2} disabled={disabled} />
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Sản phẩm dự kiến
        <input {...register('proposedExpectedOutput')} className="w-full rounded-xl border px-3 py-2" disabled={disabled} />
      </label>
      <button disabled={disabled || loading} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
        {loading ? 'Đang gửi...' : 'Gửi đề xuất'}
      </button>
    </form>
  );
}
