'use client';

import { BookOpen, Eye, GraduationCap, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import type { Topic } from '@/types/sprint2';

type Props = {
  topics: Topic[];
  onRegister: (topic: Topic) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

const countedStatuses = new Set(['PENDING_SUPERVISOR', 'PENDING_FACULTY', 'FACULTY_APPROVED', 'OFFICIALLY_ASSIGNED']);

function getCapacity(topic: Topic) {
  const registrations = topic.topicRegistrations?.filter((item) => countedStatuses.has(item.status)).length
    ?? topic._count?.topicRegistrations
    ?? 0;
  return { registrations, remaining: Math.max(0, topic.maxStudents - registrations) };
}

export function RegisterExistingTopicForm({ topics, onRegister, loading, disabled }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Topic | null>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi');
    if (!keyword) return topics;
    return topics.filter((topic) => [topic.title, topic.major, topic.supervisor?.user?.fullName]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase('vi').includes(keyword)));
  }, [query, topics]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="topic-search">Tìm đề tài</label>
        <input
          id="topic-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nhập tên đề tài, chuyên ngành hoặc GVHD..."
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Chưa có đề tài phù hợp" description="Không tìm thấy đề tài đã công bố theo điều kiện tìm kiếm." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((topic) => {
            const capacity = getCapacity(topic);
            const full = capacity.remaining <= 0;
            return (
              <article key={topic.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Đề tài đã công bố</p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-950">{topic.title}</h3>
                  </div>
                  <StatusBadge value={full ? 'CLOSED' : 'OPEN'} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-slate-400" />{topic.supervisor?.user?.fullName ?? 'Chưa cập nhật GVHD'}</p>
                  <p className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-400" />{topic.major || 'Chưa xác định chuyên ngành'}</p>
                  <p className="flex items-center gap-2 sm:col-span-2"><Users className="h-4 w-4 text-slate-400" />{capacity.registrations}/{topic.maxStudents} sinh viên · còn {capacity.remaining} vị trí</p>
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                  <button type="button" onClick={() => setSelected(topic)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Eye className="h-4 w-4" /> Xem chi tiết
                  </button>
                  <button
                    type="button"
                    disabled={disabled || loading || full}
                    onClick={() => onRegister(topic)}
                    className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {full ? 'Đã đủ sinh viên' : loading ? 'Đang xử lý...' : 'Đăng ký'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <DetailDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? 'Chi tiết đề tài'}
        description={selected ? `${selected.projectPeriod.name} · ${selected.projectPeriod.academicYear}` : undefined}
        footer={selected ? (
          <button
            type="button"
            disabled={disabled || loading || getCapacity(selected).remaining <= 0}
            onClick={() => onRegister(selected)}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {getCapacity(selected).remaining <= 0 ? 'Đề tài đã đủ sinh viên' : loading ? 'Đang xử lý...' : 'Đăng ký đề tài này'}
          </button>
        ) : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-950">Thông tin chung</h3>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Giảng viên hướng dẫn</dt><dd className="mt-1 font-semibold text-slate-900">{selected.supervisor?.user?.fullName ?? 'Chưa cập nhật'}</dd></div>
                <div><dt className="text-slate-500">Chuyên ngành</dt><dd className="mt-1 font-semibold text-slate-900">{selected.major || 'Chưa cập nhật'}</dd></div>
                <div><dt className="text-slate-500">Số sinh viên tối đa</dt><dd className="mt-1 font-semibold text-slate-900">{selected.maxStudents}</dd></div>
                <div><dt className="text-slate-500">Số vị trí còn lại</dt><dd className="mt-1 font-semibold text-slate-900">{getCapacity(selected).remaining}</dd></div>
              </dl>
            </section>
            {[['Mô tả', selected.description], ['Mục tiêu', selected.objectives], ['Sản phẩm dự kiến', selected.expectedOutput]].map(([label, content]) => (
              <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">{label}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{content || 'Chưa cập nhật.'}</p>
              </section>
            ))}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
