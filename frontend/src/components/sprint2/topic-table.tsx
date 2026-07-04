'use client';

import { BookOpen, Check, Eye, FilePenLine, Megaphone, Send, UsersRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { StatusBadge } from '@/components/common/status-badge';
import { formatShortCode } from '@/lib/formatters';
import type { Topic } from '@/types/sprint2';

type Props = {
  topics: Topic[];
  mode: 'supervisor' | 'faculty' | 'student';
  actionLoadingId?: string | null;
  onSubmitTopic?: (topic: Topic) => void;
  onApprove?: (topic: Topic) => void;
  onReject?: (topic: Topic) => void;
  onPublish?: (topic: Topic) => void;
  onEdit?: (topic: Topic) => void;
  onRegister?: (topic: Topic) => void;
};

export function TopicTable({ topics, mode, actionLoadingId, onSubmitTopic, onApprove, onReject, onPublish, onEdit, onRegister }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [period, setPeriod] = useState('ALL');
  const [major, setMajor] = useState('ALL');
  const [detail, setDetail] = useState<Topic | null>(null);

  const periods = [...new Map(topics.map((topic) => [topic.projectPeriod.id, topic.projectPeriod])).values()];
  const majors = [...new Set(topics.map((topic) => topic.major).filter(Boolean))] as string[];
  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return topics.filter((topic) => {
      const haystack = [topic.title, topic.description, topic.supervisor?.user?.fullName, topic.projectPeriod?.name, topic.major].filter(Boolean).join(' ').toLowerCase();
      return (!keyword || haystack.includes(keyword))
        && (status === 'ALL' || topic.status === status)
        && (period === 'ALL' || topic.projectPeriod.id === period)
        && (major === 'ALL' || topic.major === major);
    });
  }, [search, status, period, major, topics]);

  if (!topics.length) return <EmptyState title="Chưa có đề tài" description={mode === 'supervisor' ? 'Bấm “Tạo đề tài mới” để bắt đầu.' : 'Chưa có đề tài phù hợp trong đợt này.'} />;

  return (
    <div className="space-y-4">
      <FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm theo tên đề tài, GVHD, đợt..." resultCount={filteredTopics.length}>
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="field-input w-auto min-w-44"><option value="ALL">Tất cả đợt</option>{periods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input w-auto min-w-40"><option value="ALL">Tất cả trạng thái</option><option value="DRAFT">Bản nháp</option><option value="SUBMITTED">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Đã từ chối</option><option value="PUBLISHED">Đã công bố</option><option value="CLOSED">Đã đóng</option></select>
        {majors.length > 0 && <select value={major} onChange={(event) => setMajor(event.target.value)} className="field-input w-auto min-w-40"><option value="ALL">Tất cả chuyên ngành</option>{majors.map((item) => <option key={item} value={item}>{item}</option>)}</select>}
      </FilterBar>

      {filteredTopics.length === 0 ? <EmptyState title="Không tìm thấy đề tài" description="Hãy điều chỉnh từ khóa hoặc bộ lọc." /> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTopics.map((topic) => {
            const code = formatShortCode('DT', topic.id, topic.publishedAt ?? topic.approvedAt ?? topic.projectPeriod.startDate);
            const activeRegistrations = topic.topicRegistrations?.filter((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)).length ?? topic._count?.topicRegistrations ?? 0;
            const remaining = Math.max(0, topic.maxStudents - activeRegistrations);
            const loading = actionLoadingId === topic.id;
            return (
              <article key={topic.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{code}</p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-950">{topic.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{topic.projectPeriod.name} · {topic.major ?? 'Chưa phân ngành'}</p>
                  </div>
                  <StatusBadge value={topic.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Giảng viên hướng dẫn</p><p className="mt-1 line-clamp-1 font-semibold text-slate-800">{topic.supervisor.user.fullName}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Sức chứa</p><p className="mt-1 font-semibold text-slate-800">{activeRegistrations}/{topic.maxStudents} · còn {remaining}</p></div>
                </div>

                {topic.rejectionReason && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><strong>Lý do từ chối:</strong> {topic.rejectionReason}</div>}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setDetail(topic)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>
                  {mode === 'supervisor' && ['DRAFT', 'REJECTED'].includes(topic.status) && onEdit && <button type="button" disabled={loading} onClick={() => onEdit(topic)} className="secondary-button"><FilePenLine className="mr-1.5 h-4 w-4" />Chỉnh sửa</button>}
                  {mode === 'supervisor' && ['DRAFT', 'REJECTED'].includes(topic.status) && onSubmitTopic && <button type="button" disabled={loading} onClick={() => onSubmitTopic(topic)} className="primary-button"><Send className="mr-1.5 h-4 w-4" />{topic.status === 'REJECTED' ? 'Gửi duyệt lại' : 'Gửi duyệt'}</button>}
                  {mode === 'faculty' && topic.status === 'SUBMITTED' && onApprove && <button type="button" disabled={loading} onClick={() => onApprove(topic)} className="primary-button"><Check className="mr-1.5 h-4 w-4" />Phê duyệt</button>}
                  {mode === 'faculty' && ['SUBMITTED', 'APPROVED'].includes(topic.status) && onReject && <button type="button" disabled={loading} onClick={() => onReject(topic)} className="danger-button"><X className="mr-1.5 h-4 w-4" />Từ chối</button>}
                  {mode === 'faculty' && topic.status === 'APPROVED' && onPublish && <button type="button" disabled={loading} onClick={() => onPublish(topic)} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><Megaphone className="mr-1.5 h-4 w-4" />Công bố</button>}
                  {mode === 'student' && onRegister && topic.status === 'PUBLISHED' && remaining > 0 && <button type="button" disabled={loading} onClick={() => onRegister(topic)} className="primary-button">Đăng ký</button>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <DetailDrawer open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title ?? 'Chi tiết đề tài'} description={detail ? `${formatShortCode('DT', detail.id, detail.projectPeriod.startDate)} · ${detail.projectPeriod.name}` : undefined}>
        {detail && <div className="space-y-5">
          <section className="section-card"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-950">Thông tin chung</h3><StatusBadge value={detail.status} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">GVHD</dt><dd className="mt-1 font-semibold">{detail.supervisor.user.fullName}</dd></div><div><dt className="text-slate-500">Chuyên ngành</dt><dd className="mt-1 font-semibold">{detail.major ?? 'Chưa xác định'}</dd></div><div><dt className="text-slate-500">Số SV tối đa</dt><dd className="mt-1 font-semibold">{detail.maxStudents}</dd></div><div><dt className="text-slate-500">Nguồn đề tài</dt><dd className="mt-1 font-semibold">{(detail as any).source === 'STUDENT_PROPOSED' ? 'Sinh viên đề xuất' : 'GVHD đề xuất'}</dd></div></dl></section>
          <section className="section-card"><h3 className="flex items-center gap-2 font-bold text-slate-950"><BookOpen className="h-4 w-4" />Nội dung học thuật</h3><div className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><div><p className="font-semibold text-slate-900">Mô tả</p><p className="mt-1 whitespace-pre-line">{detail.description}</p></div><div><p className="font-semibold text-slate-900">Mục tiêu</p><p className="mt-1 whitespace-pre-line">{detail.objectives || 'Chưa cập nhật'}</p></div><div><p className="font-semibold text-slate-900">Sản phẩm dự kiến</p><p className="mt-1 whitespace-pre-line">{detail.expectedOutput || 'Chưa cập nhật'}</p></div></div></section>
          <section className="section-card"><h3 className="flex items-center gap-2 font-bold text-slate-950"><UsersRound className="h-4 w-4" />Sinh viên đăng ký</h3>{!detail.topicRegistrations?.length ? <p className="mt-3 text-sm text-slate-500">Chưa có sinh viên đăng ký.</p> : <div className="mt-3 space-y-3">{detail.topicRegistrations.map((registration) => <div key={registration.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="font-semibold text-slate-900">{registration.student.studentCode} – {registration.student.user.fullName}</p><p className="text-xs text-slate-500">{registration.student.user.email}</p></div><StatusBadge value={registration.status} /></div>)}</div>}</section>
          {detail.rejectionReason && <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><h3 className="font-bold text-rose-900">Lý do từ chối</h3><p className="mt-2 text-sm text-rose-800">{detail.rejectionReason}</p></section>}
        </div>}
      </DetailDrawer>
    </div>
  );
}
