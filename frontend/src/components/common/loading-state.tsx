import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
