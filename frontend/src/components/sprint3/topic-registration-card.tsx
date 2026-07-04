'use client';

import { Eye, GraduationCap, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import type { TopicRegistration } from '@/types/sprint3';

export function TopicRegistrationCard({ item, onView, actions }: { item: TopicRegistration; onView: () => void; actions?: ReactNode }) {
  const topicTitle = item.topic?.title ?? item.proposedTitle ?? 'Chưa cập nhật tên đề tài';
  const supervisor = item.supervisorAssignment?.supervisor.user.fullName
    ?? item.requestedSupervisor?.user.fullName
    ?? item.topic?.supervisor?.user?.fullName
    ?? 'Chưa phân công';

  return (
    <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{topicTitle}</h3>
        </div>
        <StatusBadge value={item.status} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-slate-400" />{item.registrationType === 'EXISTING_TOPIC' ? 'Đề tài có sẵn' : 'Sinh viên đề xuất'}</p>
        <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-400" />GVHD: {supervisor}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <button type="button" onClick={onView} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Eye className="h-4 w-4" /> Xem chi tiết
        </button>
        {actions}
      </div>
    </article>
  );
}
