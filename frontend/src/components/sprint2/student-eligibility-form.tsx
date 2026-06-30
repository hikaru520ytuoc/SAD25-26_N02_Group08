'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ProjectPeriodSelect, StudentSelect } from '@/components/common/selects';
import { studentEligibilitySchema } from '@/schemas/sprint2.schema';
import type { CreateStudentEligibilityInput } from '@/services/student-eligibilities.service';

type FormValues = z.infer<typeof studentEligibilitySchema>;

type Props = {
  onSubmit: (input: CreateStudentEligibilityInput) => Promise<void>;
  loading?: boolean;
};

export function StudentEligibilityForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(studentEligibilitySchema),
    defaultValues: {
      studentId: '',
      projectPeriodId: '',
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

  const projectPeriodId = watch('projectPeriodId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-950">Thêm/Xét điều kiện sinh viên</h2>
        <p className="text-sm text-slate-500">
          Chọn sinh viên và đợt đồ án bằng tên/mã dễ đọc. mã nội bộ được giữ ẩn trong form và gửi về backend.
        </p>
      </div>
      <ProjectPeriodSelect
        value={projectPeriodId}
        onChange={(value) => setValue('projectPeriodId', value, { shouldValidate: true })}
        error={errors.projectPeriodId?.message}
      />
      <StudentSelect
        value={watch('studentId')}
        projectPeriodId={projectPeriodId}
        onChange={(value) => setValue('studentId', value, { shouldValidate: true })}
        error={errors.studentId?.message}
      />
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Trạng thái thực tập
        <select {...register('internshipStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="WAIVED">Được miễn</option>
          <option value="NOT_COMPLETED">Chưa hoàn thành</option>
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700">
        Trạng thái học vụ
        <select {...register('academicStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="ACTIVE">Đang học</option>
          <option value="SUSPENDED">Tạm đình chỉ</option>
          <option value="GRADUATED">Đã tốt nghiệp</option>
          <option value="DROPPED">Thôi học</option>
        </select>
      </label>
      <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        Các thông tin học vụ bên dưới là dữ liệu nhập thủ công/phụ trợ; hệ thống tự gợi ý ELIGIBLE/NOT_ELIGIBLE và không yêu cầu nhập ID thô.
      </div>
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
        Trạng thái ghi nhận
        <select {...register('eligibilityStatus')} className="w-full rounded-xl border px-3 py-2">
          <option value="">Tự động theo điều kiện</option>
          <option value="ELIGIBLE">Đủ điều kiện</option>
          <option value="NOT_ELIGIBLE">Không đủ điều kiện</option>
          <option value="PENDING">Chờ xử lý</option>
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
