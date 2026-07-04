'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { VietnameseDateInput, toIsoDate } from '@/components/common/vietnamese-date-input';
import type { ProjectPeriodInput } from '@/services/project-periods.service';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Tên đợt đồ án là bắt buộc'),
  academicYear: z.string().trim().min(1, 'Năm học là bắt buộc'),
  semester: z.string().trim().min(1, 'Học kỳ là bắt buộc'),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  registrationStartDate: z.string().optional(),
  registrationEndDate: z.string().optional(),
}).superRefine((data, context) => {
  const start = toIsoDate(data.startDate);
  const end = toIsoDate(data.endDate);
  const registrationStart = data.registrationStartDate ? toIsoDate(data.registrationStartDate) : '';
  const registrationEnd = data.registrationEndDate ? toIsoDate(data.registrationEndDate) : '';
  if (!start) context.addIssue({ code: 'custom', path: ['startDate'], message: 'Ngày bắt đầu không hợp lệ' });
  if (!end) context.addIssue({ code: 'custom', path: ['endDate'], message: 'Ngày kết thúc không hợp lệ' });
  if (start && end && start > end) context.addIssue({ code: 'custom', path: ['endDate'], message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  if (data.registrationStartDate && !registrationStart) context.addIssue({ code: 'custom', path: ['registrationStartDate'], message: 'Ngày bắt đầu đăng ký không hợp lệ' });
  if (data.registrationEndDate && !registrationEnd) context.addIssue({ code: 'custom', path: ['registrationEndDate'], message: 'Ngày kết thúc đăng ký không hợp lệ' });
  if (registrationStart && registrationEnd && registrationStart > registrationEnd) context.addIssue({ code: 'custom', path: ['registrationEndDate'], message: 'Ngày kết thúc đăng ký phải từ ngày bắt đầu đăng ký trở đi' });
  if (start && registrationStart && registrationStart < start) context.addIssue({ code: 'custom', path: ['registrationStartDate'], message: 'Thời gian đăng ký phải nằm trong thời gian đợt' });
  if (end && registrationEnd && registrationEnd > end) context.addIssue({ code: 'custom', path: ['registrationEndDate'], message: 'Thời gian đăng ký phải nằm trong thời gian đợt' });
});

type FormValues = z.infer<typeof formSchema>;
const emptyValues: FormValues = { name: '', academicYear: '', semester: '', startDate: '', endDate: '', registrationStartDate: '', registrationEndDate: '' };

export function ProjectPeriodForm({ onSubmit, loading, onCancel }: { onSubmit: (input: ProjectPeriodInput) => Promise<void>; loading?: boolean; onCancel?: () => void }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: emptyValues });

  async function submit(values: FormValues) {
    await onSubmit({
      ...values,
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
      registrationStartDate: values.registrationStartDate ? toIsoDate(values.registrationStartDate) : undefined,
      registrationEndDate: values.registrationEndDate ? toIsoDate(values.registrationEndDate) : undefined,
    });
    reset(emptyValues);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-label md:col-span-2">Tên đợt <span className="text-rose-600">*</span><input {...register('name')} placeholder="Nhập tên đợt đồ án" className="field-input" />{errors.name && <span className="text-xs text-rose-600">{errors.name.message}</span>}</label>
        <label className="field-label">Năm học <span className="text-rose-600">*</span><input {...register('academicYear')} placeholder="Ví dụ: 2026–2027" className="field-input" />{errors.academicYear && <span className="text-xs text-rose-600">{errors.academicYear.message}</span>}</label>
        <label className="field-label">Học kỳ <span className="text-rose-600">*</span><select {...register('semester')} className="field-input"><option value="">Chọn học kỳ</option><option value="HK1">Học kỳ 1</option><option value="HK2">Học kỳ 2</option><option value="HK3">Học kỳ hè</option></select>{errors.semester && <span className="text-xs text-rose-600">{errors.semester.message}</span>}</label>
        {(['startDate', 'endDate', 'registrationStartDate', 'registrationEndDate'] as const).map((field) => {
          const labels = { startDate: 'Ngày bắt đầu', endDate: 'Ngày kết thúc', registrationStartDate: 'Bắt đầu đăng ký', registrationEndDate: 'Kết thúc đăng ký' };
          return <label key={field} className="field-label">{labels[field]}{field === 'startDate' || field === 'endDate' ? <span className="text-rose-600"> *</span> : null}<Controller name={field} control={control} render={({ field: controllerField }) => <VietnameseDateInput {...controllerField} error={errors[field]?.message} />} /></label>;
        })}
      </div>
      <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Đợt mới được lưu ở trạng thái <strong>Bản nháp</strong>. Khoa cần kiểm tra lại thông tin trước khi mở đăng ký.</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && <button type="button" disabled={loading} onClick={onCancel} className="secondary-button">Hủy</button>}
        <button type="submit" disabled={loading} className="primary-button">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loading ? 'Đang lưu...' : 'Lưu bản nháp'}</button>
      </div>
    </form>
  );
}
