'use client';

import { useMemo, useState } from 'react';
import { DataTableToolbar } from '@/components/common/data-table-toolbar';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { confirmImportantAction } from '@/components/common/confirm-dialog';
import { formatShortCode } from '@/lib/formatters';
import type { Topic } from '@/types/sprint2';

type Props = {
  topics: Topic[];
  mode: 'supervisor' | 'faculty' | 'student';
  onSubmitTopic?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
};

export function TopicTable({ topics, mode, onSubmitTopic, onApprove, onReject, onPublish }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return topics.filter((topic) => {
      const haystack = [topic.title, topic.description, topic.supervisor?.user?.fullName, topic.projectPeriod?.name].filter(Boolean).join(' ').toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (status === 'ALL' || topic.status === status);
    });
  }, [search, status, topics]);

  if (!topics.length) return <EmptyState title="Chưa có đề tài" description="Đề tài được công bố sẽ hiển thị tại đây." />;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statuses={[
          { value: 'DRAFT', label: 'Nháp' },
          { value: 'SUBMITTED', label: 'Chờ duyệt' },
          { value: 'APPROVED', label: 'Đã duyệt' },
          { value: 'PUBLISHED', label: 'Đã công bố' },
          { value: 'REJECTED', label: 'Bị từ chối' },
        ]}
        placeholder="Tìm theo tên đề tài, GVHD, đợt đồ án..."
      />
      {filteredTopics.length === 0 ? (
        <div className="p-5"><EmptyState /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Mã</th>
                <th className="p-4">Đề tài</th>
                <th className="p-4">GVHD</th>
                <th className="p-4">Đợt</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="border-t border-slate-100 align-top">
                  <td className="p-4 font-mono text-xs text-slate-500">{formatShortCode('DT', topic.id, topic.publishedAt ?? topic.approvedAt ?? topic.projectPeriod.startDate)}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-950">{topic.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{topic.description}</p>
                    {topic.rejectionReason && <p className="mt-2 text-xs text-red-600">Lý do từ chối: {topic.rejectionReason}</p>}
                  </td>
                  <td className="p-4">{topic.supervisor.user.fullName}</td>
                  <td className="p-4">{topic.projectPeriod.name}</td>
                  <td className="p-4"><StatusBadge value={topic.status} /></td>
                  <td className="space-y-2 p-4">
                    {mode === 'supervisor' && ['DRAFT', 'REJECTED'].includes(topic.status) && onSubmitTopic && (
                      <button onClick={() => confirmImportantAction('Gửi đề tài này cho Khoa xét duyệt?') && onSubmitTopic(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Gửi duyệt</button>
                    )}
                    {mode === 'faculty' && topic.status === 'SUBMITTED' && onApprove && (
                      <button onClick={() => confirmImportantAction('Duyệt đề tài này?') && onApprove(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Duyệt</button>
                    )}
                    {mode === 'faculty' && ['SUBMITTED', 'APPROVED'].includes(topic.status) && onReject && (
                      <button onClick={() => confirmImportantAction('Từ chối đề tài này?') && onReject(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Từ chối</button>
                    )}
                    {mode === 'faculty' && topic.status === 'APPROVED' && onPublish && (
                      <button onClick={() => confirmImportantAction('Công bố đề tài này cho sinh viên?') && onPublish(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Công bố</button>
                    )}
                    {mode === 'student' && <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Đăng ký tại màn Đăng ký đề tài</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
