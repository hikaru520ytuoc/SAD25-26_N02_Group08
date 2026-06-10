'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { getMyArchives } from '@/services/archives.service';
import type { ArchiveRecord } from '@/types/sprint8';

export default function LockedRecordsPage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  useEffect(() => { getMyArchives().then(setItems).catch(() => setItems([])); }, []);
  const locked = items.filter((item) => item.status === 'LOCKED');
  return <AppShell><div className="space-y-6"><h1 className="text-3xl font-bold">Hồ sơ đã khóa</h1>{locked.length === 0 && <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có hồ sơ đã khóa.</div>}{locked.map((item) => <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm"><p className="font-semibold">Hồ sơ đã khóa, chỉ được tra cứu</p><p>Ngày khóa: {item.lockedAt ? new Date(item.lockedAt).toLocaleString() : 'N/A'}</p><p>Kết quả: {item.finalResult?.resultStatus} - Điểm: {item.finalResult?.finalScore}</p></div>)}</div></AppShell>;
}
