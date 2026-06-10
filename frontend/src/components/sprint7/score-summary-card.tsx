import type { ScoreSummary } from '@/types/sprint7';

export function ScoreSummaryCard({ summary }: { summary: ScoreSummary | null }) {
  return (
    <div className="grid gap-3 rounded-2xl border bg-slate-50 p-4 text-sm md:grid-cols-4">
      <div><p className="text-slate-500">Điểm GVHD</p><p className="text-xl font-bold">{summary?.supervisorScore ?? '-'}</p></div>
      <div><p className="text-slate-500">Điểm GVPB</p><p className="text-xl font-bold">{summary?.reviewerScore ?? '-'}</p></div>
      <div><p className="text-slate-500">Điểm HĐ TB</p><p className="text-xl font-bold">{summary?.councilAverageScore ?? '-'}</p></div>
      <div><p className="text-slate-500">Điểm tổng kết</p><p className="text-xl font-bold">{summary?.finalScore ?? '-'}</p></div>
    </div>
  );
}
