'use client';

import { useEffect, useState } from 'react';
import { Award, CheckCircle2, ClipboardCheck, Scale } from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { getMyResult } from '@/services/results.service';
import type { FinalResult } from '@/types/sprint7';

export default function StudentResultPage() {
  const [result, setResult] = useState<FinalResult | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { setResult(await getMyResult()); } catch (err) { setError(err instanceof Error ? err.message : 'Kết quả chưa được công bố'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  return <div className="space-y-6"><PageHeader title="Kết quả bảo vệ của tôi" description="Kết quả chỉ hiển thị sau khi Khoa xác nhận và công bố chính thức." />{error && !loading && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={4} /> : !result ? <EmptyState title="Chưa có kết quả công bố" description="Bạn sẽ nhận được thông báo khi Khoa công bố kết quả bảo vệ." /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Điểm GVHD" value={result.supervisorScore} icon={ClipboardCheck} tone="blue" /><SummaryStatCard label="Điểm GVPB" value={result.reviewerScore} icon={Scale} tone="amber" /><SummaryStatCard label="Điểm hội đồng" value={result.councilAverageScore} icon={Award} /><SummaryStatCard label="Điểm tổng kết" value={result.finalScore} icon={CheckCircle2} tone="emerald" /></div><article className="section-card"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Kết quả chính thức</p><h2 className="mt-2 text-4xl font-black text-slate-950">{result.finalScore}<span className="text-lg font-medium text-slate-400"> / 10</span></h2></div><div className="flex flex-wrap gap-2"><StatusBadge value={result.resultStatus} /><StatusBadge value={result.publicationStatus} /></div></div><div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3"><Score label="GVHD" value={result.supervisorScore} /><Score label="GVPB" value={result.reviewerScore} /><Score label="Hội đồng trung bình" value={result.councilAverageScore} /></div>{result.revisionRequired && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-bold text-amber-900">Yêu cầu chỉnh sửa sau bảo vệ</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">{result.revisionNote || 'Hội đồng yêu cầu nộp bản chỉnh sửa.'}</p></section>}</article></>}</div>;
}
function Score({ label, value }: { label: string; value: number }) { return <div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p></div>; }
