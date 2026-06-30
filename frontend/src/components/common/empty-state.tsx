import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Chưa có dữ liệu', description = 'Không tìm thấy bản ghi phù hợp.' }: { title?: string; description?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Inbox className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
