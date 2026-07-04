'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
  const [facultyAssigns, setFacultyAssigns] = useState(false);
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
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

  async function submit(values: FormValues) {
    await onSubmit({ ...values, requestedSupervisorId: facultyAssigns ? undefined : values.requestedSupervisorId || undefined });
    reset();
    setFacultyAssigns(false);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 sm:p-6">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Đề xuất đề tài mới</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Đợt đồ án được lấy tự động từ hồ sơ của bạn. Các trường không có dữ liệu mẫu và chỉ lưu nội dung bạn nhập.</p>
      </div>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
        Tên đề tài <span className="text-rose-600">*</span>
        <input {...register('proposedTitle')} placeholder="Nhập tên đề tài" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" disabled={disabled} />
        {errors.proposedTitle && <p className="text-xs text-rose-600">{errors.proposedTitle.message}</p>}
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
        Mô tả <span className="text-rose-600">*</span>
        <textarea {...register('proposedDescription')} placeholder="Mô tả phạm vi và vấn đề cần giải quyết" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" rows={4} disabled={disabled} />
        {errors.proposedDescription && <p className="text-xs text-rose-600">{errors.proposedDescription.message}</p>}
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        Chuyên ngành/lĩnh vực
        <input {...register('proposedMajor')} placeholder="Ví dụ: Kỹ thuật phần mềm" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" disabled={disabled} />
      </label>
      <div className="space-y-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={facultyAssigns}
            onChange={(event) => {
              setFacultyAssigns(event.target.checked);
              if (event.target.checked) setValue('requestedSupervisorId', '');
            }}
            disabled={disabled}
          />
          Để Khoa phân công GVHD
        </label>
        {!facultyAssigns && (
          <SupervisorSelect
            optional
            disabled={disabled}
            value={watch('requestedSupervisorId') ?? ''}
            onChange={(value) => setValue('requestedSupervisorId', value || undefined)}
            label="GVHD đề xuất"
          />
        )}
      </div>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
        Mục tiêu
        <textarea {...register('proposedObjectives')} placeholder="Các mục tiêu chính của đề tài" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" rows={3} disabled={disabled} />
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
        Sản phẩm dự kiến
        <textarea {...register('proposedExpectedOutput')} placeholder="Mô tả sản phẩm hoặc kết quả dự kiến" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" rows={2} disabled={disabled} />
      </label>
      <div className="flex justify-end md:col-span-2">
        <button disabled={disabled || loading} className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto">
          {loading ? 'Đang gửi...' : 'Gửi đề xuất'}
        </button>
      </div>
    </form>
  );
}
