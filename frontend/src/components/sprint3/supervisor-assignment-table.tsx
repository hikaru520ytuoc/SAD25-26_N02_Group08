'use client';

import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import type { SupervisorAssignment } from '@/types/sprint3';

const assignmentTypeLabels: Record<string, string> = {
  TOPIC_OWNER: 'GVHD sở hữu đề tài',
  STUDENT_REQUESTED: 'Sinh viên đề xuất',
  FACULTY_ASSIGNED: 'Khoa phân công',
};

type Props = { items: SupervisorAssignment[]; mode?: 'faculty' | 'supervisor' | 'student'; search?: string };

export function SupervisorAssignmentTable({ items, mode = 'faculty', search = '' }: Props) {
  const [selected, setSelected] = useState<SupervisorAssignment | null>(null);
  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    if (!keyword) return items;
    return items.filter((item) => [item.student.studentCode, item.student.user.fullName, item.supervisor.user.fullName, item.topic?.title, item.projectPeriod.name].some((value) => value?.toLocaleLowerCase('vi').includes(keyword)));
  }, [items, search]);

  if (filtered.length === 0) return <EmptyState title="Chưa có phân công GVHD" description="Không tìm thấy phân công phù hợp với bộ lọc hiện tại." />;

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((item) => (
          <article key={item.id} className="section-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-bold text-slate-950">{item.student.studentCode} – {item.student.user.fullName}</h2><p className="mt-1 text-sm text-slate-500">{item.topic?.title ?? item.topicRegistration?.proposedTitle ?? 'Đề tài sinh viên đề xuất'}</p></div>
              <StatusBadge value={item.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {mode !== 'student' && <p><span className="text-slate-500">GVHD:</span> <strong>{item.supervisor.user.fullName}</strong></p>}
              <p><span className="text-slate-500">Đợt:</span> <strong>{item.projectPeriod.name}</strong></p>
              <p><span className="text-slate-500">Hình thức:</span> <strong>{assignmentTypeLabels[item.assignmentType] ?? 'Chưa xác định'}</strong></p>
              <p><span className="text-slate-500">Phân công:</span> <strong>{new Date(item.assignedAt).toLocaleDateString('vi-VN')}</strong></p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4"><button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button></div>
          </article>
        ))}
      </div>
      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.student.studentCode} – ${selected.student.user.fullName}` : 'Chi tiết phân công'} description="Thông tin GVHD chính thức và tiến trình liên quan.">
        {selected && <div className="space-y-5">
          <section className="section-card"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Thông tin sinh viên</h3><StatusBadge value={selected.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Mã sinh viên" value={selected.student.studentCode} /><Info label="Họ tên" value={selected.student.user.fullName} /><Info label="Lớp" value={selected.student.className} /><Info label="Ngành" value={`${selected.student.major.code} - ${selected.student.major.name}`} /><Info label="Email" value={selected.student.user.email} /></dl></section>
          <section className="section-card"><h3 className="font-bold">Đề tài và GVHD</h3><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Đề tài" value={selected.topic?.title ?? selected.topicRegistration?.proposedTitle ?? 'Đề tài sinh viên đề xuất'} /><Info label="GVHD" value={selected.supervisor.user.fullName} /><Info label="Mã giảng viên" value={selected.supervisor.lecturerCode} /><Info label="Hình thức" value={assignmentTypeLabels[selected.assignmentType] ?? 'Chưa xác định'} /><Info label="Đợt đồ án" value={selected.projectPeriod.name} /><Info label="Ngày phân công" value={new Date(selected.assignedAt).toLocaleDateString('vi-VN')} /></dl></section>
          <section className="section-card"><h3 className="font-bold">Workflow hiện tại</h3><p className="mt-3 text-sm text-slate-600">Phân công đã được xác nhận. Các bước đề cương, tiến độ, bảo vệ, phản biện, kết quả và lưu trữ được hiển thị tại các module nghiệp vụ tương ứng.</p></section>
        </div>}
      </DetailDrawer>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) { return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value || '-'}</dd></div>; }
