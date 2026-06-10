'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FinalResultTable } from '@/components/sprint7/final-result-table';
import { confirmResult, generateResult, getPendingResults, publishResult } from '@/services/results.service';
import type { FinalResult } from '@/types/sprint7';

export default function FacultyResultsPage() {
  const [items, setItems] = useState<FinalResult[]>([]);
  const [defenseRegistrationId, setDefenseRegistrationId] = useState('');
  const [error, setError] = useState('');

  async function load() { try { setItems(await getPendingResults()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải kết quả'); } }
  async function generate() { await generateResult(defenseRegistrationId); setDefenseRegistrationId(''); await load(); }
  async function confirm(id: string, resultStatus: FinalResult['resultStatus']) { await confirmResult(id, { resultStatus, revisionRequired: resultStatus === 'PASSED_WITH_REVISION' }); await load(); }
  async function publish(id: string) { await publishResult(id); await load(); }
  useEffect(() => { void load(); }, []);

  return <AppShell><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Kết quả bảo vệ</h1><p className="mt-2 text-slate-600">Tính điểm tổng kết, xác nhận và công bố kết quả cho sinh viên.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>{error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}<div className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Generate result</h2><p className="mt-1 text-sm text-slate-500">Nhập defenseRegistrationId đã đủ điểm GVHD, GVPB và hội đồng.</p><div className="mt-4 flex gap-2"><input value={defenseRegistrationId} onChange={(event) => setDefenseRegistrationId(event.target.value)} placeholder="defenseRegistrationId" className="flex-1 rounded-xl border px-4 py-3 text-sm" /><button onClick={generate} disabled={!defenseRegistrationId} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Generate</button></div></div><FinalResultTable results={items} onConfirm={confirm} onPublish={publish} /></div></AppShell>;
}
