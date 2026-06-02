'use client';

import type { Topic } from '@/types/sprint2';
import { StatusBadge } from './status-badge';

type Props = {
  topics: Topic[];
  mode: 'supervisor' | 'faculty' | 'student';
  onSubmitTopic?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
};

export function TopicTable({ topics, mode, onSubmitTopic, onApprove, onReject, onPublish }: Props) {
  if (!topics.length) {
    return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có đề tài.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-4">Đề tài</th>
            <th className="p-4">GVHD</th>
            <th className="p-4">Đợt</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id} className="border-t border-slate-100 align-top">
              <td className="p-4">
                <p className="font-semibold text-slate-950">{topic.title}</p>
                <p className="mt-1 text-xs text-slate-500">{topic.description}</p>
                {topic.rejectionReason && <p className="mt-2 text-xs text-red-600">Lý do từ chối: {topic.rejectionReason}</p>}
              </td>
              <td className="p-4">{topic.supervisor.user.fullName}</td>
              <td className="p-4">{topic.projectPeriod.name}</td>
              <td className="p-4"><StatusBadge value={topic.status} /></td>
              <td className="space-y-2 p-4">
                {mode === 'supervisor' && ['DRAFT', 'REJECTED'].includes(topic.status) && onSubmitTopic && (
                  <button onClick={() => onSubmitTopic(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Gửi duyệt</button>
                )}
                {mode === 'faculty' && topic.status === 'SUBMITTED' && onApprove && (
                  <button onClick={() => onApprove(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50">Duyệt</button>
                )}
                {mode === 'faculty' && ['SUBMITTED', 'APPROVED'].includes(topic.status) && onReject && (
                  <button onClick={() => onReject(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Từ chối</button>
                )}
                {mode === 'faculty' && topic.status === 'APPROVED' && onPublish && (
                  <button onClick={() => onPublish(topic.id)} className="block rounded-lg border px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Công bố</button>
                )}
                {mode === 'student' && <button disabled className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Đăng ký ở Sprint 3</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
