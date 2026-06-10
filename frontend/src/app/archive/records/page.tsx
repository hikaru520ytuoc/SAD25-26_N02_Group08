'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { approveArchive, completeArchive, getArchives, lockArchive, requestArchiveSupplement } from '@/services/archives.service';
import type { ArchiveRecord } from '@/types/sprint8';

export default function ArchiveRecordsPage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  async function load() { try { setItems(await getArchives()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được hồ sơ'); } }
  useEffect(() => { load(); }, []);
  async function supplement(id: string) { await requestArchiveSupplement(id, { supplementReason: reason }); setReason(''); await load(); }
  async function approve(id: string) { await approveArchive(id); await load(); }
  async function complete(id: string) { await completeArchive(id); await load(); }
  async function lock(id: string) { await lockArchive(id); await load(); }
  return <AppShell><div className="space-y-6"><h1 className="text-3xl font-bold">Kiểm tra hồ sơ lưu trữ</h1>{error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}<div className="rounded-3xl bg-white p-6 shadow-sm"><table className="w-full text-sm"><thead><tr className="text-left"><th>Sinh viên</th><th>Trạng thái</th><th>Lý do</th><th>Thao tác</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t"><td className="py-3">{item.finalResult?.student?.user?.fullName ?? item.student?.user?.fullName}</td><td>{item.status}</td><td><input value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-lg border px-2 py-1" placeholder="Lý do bổ sung" /></td><td className="space-x-2"><button onClick={() => supplement(item.id)} className="rounded-lg bg-amber-600 px-3 py-1 text-white">Yêu cầu bổ sung</button><button onClick={() => approve(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-white">Duyệt</button><button onClick={() => complete(item.id)} className="rounded-lg bg-blue-600 px-3 py-1 text-white">Hoàn tất</button><button onClick={() => lock(item.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-white">Khóa</button></td></tr>)}</tbody></table></div></div></AppShell>;
}
