'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CouncilScoreForm } from '@/components/sprint7/council-score-form';
import { getStoredUser } from '@/lib/auth-storage';
import { getCouncilDefenseSchedules } from '@/services/defense-schedules.service';
import { getCouncilScores, saveCouncilScore } from '@/services/council-scores.service';
import type { DefenseSchedule } from '@/types/sprint6';
import type { CouncilScore } from '@/types/sprint7';
import type { CouncilScoreValues } from '@/schemas/sprint7.schema';

export default function CouncilMyScoresPage() {
  const [items, setItems] = useState<DefenseSchedule[]>([]);
  const [scores, setScores] = useState<Record<string, CouncilScore[]>>({});
  const [error, setError] = useState('');
  const user = getStoredUser();

  async function load() {
    try {
      const schedules = await getCouncilDefenseSchedules();
      setItems(schedules);
      const entries = await Promise.all(schedules.map(async (schedule) => [schedule.id, await getCouncilScores(schedule.id)] as const));
      setScores(Object.fromEntries(entries));
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'); }
  }
  async function submit(values: CouncilScoreValues) { await saveCouncilScore(values); await load(); }
  useEffect(() => { void load(); }, []);

  return <AppShell><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Điểm của tôi trong hội đồng</h1><p className="mt-2 text-slate-600">Thành viên hội đồng nhập điểm của chính mình.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>{error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}{items.map((schedule) => { const member = schedule.council?.members?.find((m) => m.userId === user?.id); const score = scores[schedule.id]?.find((s) => s.councilMemberId === member?.id); return <div key={schedule.id} className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{schedule.student?.user?.fullName ?? schedule.studentId}</h2><p className="mt-1 text-sm text-slate-500">{schedule.room} - {new Date(schedule.startTime).toLocaleString()}</p><p className="mt-3 text-sm">Điểm hiện tại: <b>{score?.score ?? 'Chưa nhập'}</b></p>{member ? <div className="mt-4"><CouncilScoreForm defenseScheduleId={schedule.id} councilMemberId={member.id} onSubmit={submit} /></div> : <p className="mt-4 text-red-600">Bạn không phải thành viên của hội đồng này.</p>}</div>; })}</div></AppShell>;
}
