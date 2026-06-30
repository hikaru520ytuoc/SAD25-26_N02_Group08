'use client';

import { useEffect, useState } from 'react';
import { ArchiveStatusCard } from '@/components/sprint8/archive-status-card';
import { getMyArchives } from '@/services/archives.service';
import type { ArchiveRecord } from '@/types/sprint8';

export default function LockedRecordsPage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  useEffect(() => { getMyArchives().then(setItems).catch(() => setItems([])); }, []);
  const locked = items.filter((item) => item.status === 'LOCKED');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Hồ sơ đã khóa</h1>
        <p className="mt-2 text-sm text-slate-600">Hồ sơ khóa chỉ được xem/tải file theo quyền, không được chỉnh sửa.</p>
      </div>
      {locked.length === 0 ? <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có hồ sơ đã khóa.</div> : null}
      {locked.map((item) => <ArchiveStatusCard key={item.id} record={item} />)}
    </div>
  );
}
