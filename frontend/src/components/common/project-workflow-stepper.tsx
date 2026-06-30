'use client';

import { Check, Lock, Circle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const steps = [
  { key: 'eligibility', label: 'Đủ điều kiện', paths: ['/faculty/student-eligibilities'] },
  { key: 'topic', label: 'Đăng ký đề tài', paths: ['/student/topic-registration', '/topics'] },
  { key: 'supervisor', label: 'Chốt GVHD', paths: ['/student/supervisor-assignment'] },
  { key: 'outline', label: 'Nộp đề cương', paths: ['/student/outline'] },
  { key: 'progress', label: 'Thực hiện đồ án', paths: ['/student/progress'] },
  { key: 'defense', label: 'Đăng ký bảo vệ', paths: ['/student/defense-registration'] },
  { key: 'reviewer', label: 'Phản biện', paths: ['/reviewer/assignments'] },
  { key: 'council', label: 'Hội đồng', paths: ['/student/defense-schedule', '/council/schedules'] },
  { key: 'score', label: 'Chấm điểm', paths: ['/secretary/council-scoring', '/council/my-scores'] },
  { key: 'result', label: 'Kết quả', paths: ['/student/result'] },
  { key: 'revision', label: 'Chỉnh sửa', paths: ['/student/revision'] },
  { key: 'archive', label: 'Lưu trữ', paths: ['/student/archive'] },
  { key: 'locked', label: 'Khóa hồ sơ', paths: ['/records/locked'] },
];

export function ProjectWorkflowStepper({ locked = false }: { locked?: boolean }) {
  const pathname = usePathname();
  const currentIndex = Math.max(0, steps.findIndex((step) => step.paths.some((path) => pathname.startsWith(path))));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-950">Tiến trình đồ án tốt nghiệp</h2>
          <p className="text-xs text-slate-500">Stepper tổng quan cho sinh viên, không thay đổi workflow backend.</p>
        </div>
        {locked && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">Hồ sơ đã khóa</span>}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const done = locked || index < currentIndex;
          const active = index === currentIndex && !locked;
          return (
            <div key={step.key} className="flex min-w-[120px] items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${done ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : active ? 'bg-blue-600 text-white ring-blue-600' : 'bg-slate-50 text-slate-400 ring-slate-200'}`}>
                {done ? <Check className="h-4 w-4" /> : locked ? <Lock className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-blue-700' : done ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
