'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { topicSchema } from '@/schemas/sprint2.schema';
import type { TopicInput } from '@/services/topics.service';

type FormValues = z.infer<typeof topicSchema>;

type Props = {
  onSubmit: (input: TopicInput) => Promise<void>;
  loading?: boolean;
};

export function TopicForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: 'Xây dựng hệ thống quản lý đồ án tốt nghiệp',
      description: 'Đề tài xây dựng web app quản lý quy trình đồ án tốt nghiệp.',
      maxStudents: 1,
      major: 'Software Engineering',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Tạo đề tài</h2>
        <p className="text-sm text-slate-500">Supervisor tạo đề tài ở trạng thái DRAFT, sau đó gửi Khoa duyệt.</p>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Tên đề tài
        <input {...register('title')} className="w-full rounded-xl border px-3 py-2" />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Mô tả
        <textarea {...register('description')} className="w-full rounded-xl border px-3 py-2" rows={3} />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Project Period ID
        <input {...register('projectPeriodId')} className="w-full rounded-xl border px-3 py-2" placeholder="UUID đợt đồ án" />
        {errors.projectPeriodId && <p className="text-xs text-red-600">{errors.projectPeriodId.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Số SV tối đa
        <input type="number" {...register('maxStudents')} className="w-full rounded-xl border px-3 py-2" />
        {errors.maxStudents && <p className="text-xs text-red-600">{errors.maxStudents.message}</p>}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Ngành
        <input {...register('major')} className="w-full rounded-xl border px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Sản phẩm dự kiến
        <input {...register('expectedOutput')} className="w-full rounded-xl border px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
        Mục tiêu
        <textarea {...register('objectives')} className="w-full rounded-xl border px-3 py-2" rows={2} />
      </label>
      <button disabled={loading} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
        {loading ? 'Đang tạo...' : 'Tạo đề tài'}
      </button>
    </form>
  );
}
