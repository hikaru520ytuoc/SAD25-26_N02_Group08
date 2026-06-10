import type { FinalResult } from '@/types/sprint7';
import { ResultStatusBadge } from './result-status-badge';

export function StudentResultCard({ result }: { result: FinalResult }) {
  return <div className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><h2 className="text-2xl font-bold">Kết quả bảo vệ</h2><p className="mt-2 text-slate-600">Điểm tổng kết: <b>{result.finalScore}</b></p></div><ResultStatusBadge status={result.resultStatus} /></div><div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><div>GVHD: <b>{result.supervisorScore}</b></div><div>GVPB: <b>{result.reviewerScore}</b></div><div>Hội đồng TB: <b>{result.councilAverageScore}</b></div></div>{result.revisionNote ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-amber-800">{result.revisionNote}</p> : null}</div>;
}
