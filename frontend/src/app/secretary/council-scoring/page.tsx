'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CouncilScoreTable } from '@/components/sprint7/council-score-table';
import { calculateScore, getCouncilScores, getScoreSummary, saveCouncilScore } from '@/services/council-scores.service';
import { getCouncilDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseSchedule } from '@/types/sprint6';
import type { CouncilScore, ScoreSummary } from '@/types/sprint7';
import type { CouncilScoreValues } from '@/schemas/sprint7.schema';

export default function SecretaryCouncilScoringPage() {
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [selected, setSelected] = useState<DefenseSchedule | null>(null);
  const [scores, setScores] = useState<CouncilScore[]>([]);
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await getCouncilDefenseSchedules();
      setSchedules(data);
      const first = data[0] ?? null;
      setSelected(first);
      if (first) await loadScores(first);
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'); }
  }

  async function loadScores(schedule: DefenseSchedule) {
    setSelected(schedule);
    setScores(await getCouncilScores(schedule.id));
    setSummary(await getScoreSummary(schedule.defenseRegistrationId).catch(() => null));
  }

  async function submit(values: CouncilScoreValues) {
    await saveCouncilScore(values);
    if (selected) await loadScores(selected);
  }

  async function calculate() {
    if (!selected) return;
    setSummary(await calculateScore(selected.defenseRegistrationId));
    await loadScores(selected);
  }

  useEffect(() => { void load(); }, []);

  return <AppShell><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Nhập điểm hội đồng</h1><p className="mt-2 text-slate-600">Thư ký nhập điểm từng thành viên hội đồng và tính điểm tổng hợp.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>{error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}<div className="grid gap-4 lg:grid-cols-3"><div className="space-y-3 lg:col-span-1">{schedules.map((item) => <button key={item.id} onClick={() => void loadScores(item)} className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm ${selected?.id === item.id ? 'ring-2 ring-blue-300' : ''}`}><p className="font-bold">{item.student?.user?.fullName ?? item.studentId}</p><p className="text-sm text-slate-500">{item.room} - {new Date(item.startTime).toLocaleString()}</p><p className="text-xs text-slate-400">{item.status}</p></button>)}</div><div className="lg:col-span-2">{selected ? <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{selected.council?.name}</h2><button onClick={calculate} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Tính điểm tổng hợp</button></div><CouncilScoreTable scheduleId={selected.id} members={selected.council?.members ?? []} scores={scores} summary={summary} onSubmit={submit} /></div> : <div className="rounded-3xl bg-white p-6">Chưa có lịch bảo vệ.</div>}</div></div></div></AppShell>;
}
