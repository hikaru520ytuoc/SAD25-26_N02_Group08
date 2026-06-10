'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StudentResultCard } from '@/components/sprint7/student-result-card';
import { getMyResult } from '@/services/results.service';
import type { FinalResult } from '@/types/sprint7';

export default function StudentResultPage() {
  const [result, setResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { getMyResult().then(setResult).catch((err) => setError(err instanceof Error ? err.message : 'Chưa có kết quả')); }, []);
  return <AppShell><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Kết quả bảo vệ của tôi</h1><p className="mt-2 text-slate-600">Sinh viên chỉ xem được kết quả sau khi Khoa công bố.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>{result ? <StudentResultCard result={result} /> : <div className="rounded-3xl bg-white p-6 shadow-sm">{error || 'Chưa công bố kết quả.'}</div>}</div></AppShell>;
}
