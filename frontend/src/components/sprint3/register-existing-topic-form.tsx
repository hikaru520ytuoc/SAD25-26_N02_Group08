'use client';

import type { Topic } from '@/types/sprint2';

type Props = {
  topics: Topic[];
  onRegister: (topic: Topic) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

export function RegisterExistingTopicForm({ topics, onRegister, loading, disabled }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Đăng ký đề tài có sẵn</h2>
      <p className="mt-1 text-sm text-slate-500">Sprint 3 chỉ ghi nhận đăng ký, chưa xử lý nộp đề cương.</p>
      <div className="mt-5 space-y-4">
        {topics.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có đề tài đã công bố.</p>}
        {topics.map((topic) => (
          <div key={topic.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">{topic.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{topic.description}</p>
                <p className="mt-2 text-xs text-slate-500">GVHD: {topic.supervisor?.user?.fullName} · Tối đa {topic.maxStudents} SV</p>
              </div>
              <button
                disabled={disabled || loading}
                onClick={() => onRegister(topic)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Đăng ký
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
