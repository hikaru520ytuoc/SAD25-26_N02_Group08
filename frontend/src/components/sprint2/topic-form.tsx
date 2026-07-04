'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { ProjectPeriodSelect } from '@/components/common/selects';
import { topicSchema } from '@/schemas/sprint2.schema';
import type { TopicInput } from '@/services/topics.service';

type FormValues = z.infer<typeof topicSchema>;
const emptyValues: DefaultValues<FormValues> = { title: '', description: '', objectives: '', expectedOutput: '', major: '', maxStudents: undefined, projectPeriodId: '' };

export function TopicForm({ onSubmit, loading, initialValues, submitLabel = 'Lưu bản nháp', onCancel }: { onSubmit: (input: TopicInput) => Promise<void>; loading?: boolean; initialValues?: Partial<TopicInput> | null; submitLabel?: string; onCancel?: () => void }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(topicSchema), defaultValues: emptyValues });

  useEffect(() => {
    reset({ ...emptyValues, ...initialValues });
  }, [initialValues, reset]);

  async function submit(values: FormValues) {
    await onSubmit(values);
    if (!initialValues) reset(emptyValues);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-label md:col-span-2">Tên đề tài <span className="text-rose-600">*</span><input {...register('title')} placeholder="Nhập tên đề tài" className="field-input" />{errors.title && <span className="text-xs text-rose-600">{errors.title.message}</span>}</label>
        <label className="field-label md:col-span-2">Mô tả <span className="text-rose-600">*</span><textarea {...register('description')} placeholder="Mô tả ngắn gọn phạm vi và vấn đề cần giải quyết" className="field-input resize-y" rows={4} />{errors.description && <span className="text-xs text-rose-600">{errors.description.message}</span>}</label>
        <ProjectPeriodSelect status="OPEN" value={watch('projectPeriodId')} onChange={(value) => setValue('projectPeriodId', value, { shouldValidate: true })} error={errors.projectPeriodId?.message} />
        <label className="field-label">Số sinh viên tối đa <span className="text-rose-600">*</span><input type="number" min={1} {...register('maxStudents')} className="field-input" />{errors.maxStudents && <span className="text-xs text-rose-600">{errors.maxStudents.message}</span>}</label>
        <label className="field-label">Chuyên ngành/lĩnh vực<input {...register('major')} placeholder="Nhập chuyên ngành phù hợp" className="field-input" /></label>
        <label className="field-label">Sản phẩm dự kiến<input {...register('expectedOutput')} placeholder="Mô tả sản phẩm đầu ra" className="field-input" /></label>
        <label className="field-label md:col-span-2">Mục tiêu<textarea {...register('objectives')} placeholder="Các mục tiêu chính của đề tài" className="field-input resize-y" rows={3} /></label>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && <button type="button" disabled={loading} onClick={onCancel} className="secondary-button">Hủy</button>}
        <button type="submit" disabled={loading} className="primary-button">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loading ? 'Đang lưu...' : submitLabel}</button>
      </div>
    </form>
  );
}
