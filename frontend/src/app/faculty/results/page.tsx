'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DefenseRegistrationSelect } from '@/components/common/selects';
import { FinalResultTable } from '@/components/sprint7/final-result-table';
import { confirmResult, generateResult, getPendingResults, publishResult } from '@/services/results.service';
import type { LookupOption } from '@/services/lookups.service';
import type { FinalResult } from '@/types/sprint7';

export default function FacultyResultsPage() {
  const [items, setItems] = useState<FinalResult[]>([]);
  const [defenseRegistrationId, setDefenseRegistrationId] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<LookupOption | undefined>();
  const [error, setError] = useState('');

  async function load() { try { setItems(await getPendingResults()); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải kết quả'); } }
  async function generate() { await generateResult(defenseRegistrationId); setDefenseRegistrationId(''); setSelectedRegistration(undefined); await load(); }
  async function confirm(id: string, resultStatus: FinalResult['resultStatus']) { await confirmResult(id, { resultStatus, revisionRequired: resultStatus === 'PASSED_WITH_REVISION' }); await load(); }
  async function publish(id: string) { await publishResult(id); await load(); }
  useEffect(() => { void load(); }, []);

  return <><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Kết quả bảo vệ</h1><p className="mt-2 text-slate-600">Tính điểm tổng kết, xác nhận và công bố kết quả cho sinh viên.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>{error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}<div className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Tạo kết quả</h2><p className="mt-1 text-sm text-slate-500">Chọn hồ sơ bảo vệ đã đủ điểm. Hệ thống tự tính điểm hội đồng trung bình và điểm tổng kết.</p><div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><DefenseRegistrationSelect status="READY_FOR_COUNCIL,APPROVED_BY_REVIEWER" value={defenseRegistrationId} onChange={(value, option) => { setDefenseRegistrationId(value); setSelectedRegistration(option); }} label="Hồ sơ đủ điều kiện tính kết quả" /><button onClick={generate} disabled={!defenseRegistrationId} className="self-end rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Generate</button></div>{selectedRegistration ? <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><p className="font-semibold">{selectedRegistration.label}</p><p>{selectedRegistration.subLabel}</p><p className="mt-2">Điểm tổng kết sẽ do backend tự tính theo công thức: (Điểm hội đồng × 2 + Điểm GVHD + Điểm GVPB) / 4.</p></div> : null}</div><FinalResultTable results={items} onConfirm={confirm} onPublish={publish} /></div></>;
}
