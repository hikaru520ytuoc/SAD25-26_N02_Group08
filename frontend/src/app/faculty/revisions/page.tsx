'use client';

import { useEffect, useState } from 'react';
import { approveRevision, getRevisions, requestRevisionChanges } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';

export default function FacultyRevisionsPage() {
  const [items, setItems] = useState<RevisionRequest[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  async function load() { try { setItems(await getRevisions()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được dữ liệu'); } }
  useEffect(() => { load(); }, []);
  async function approve(id: string) { await approveRevision(id); await load(); }
  async function changes(id: string) { await requestRevisionChanges(id, { feedback }); setFeedback(''); await load(); }
  return <><div className="space-y-6"><h1 className="text-3xl font-bold">Kiểm tra bản chỉnh sửa</h1>{error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}<div className="rounded-3xl bg-white p-6 shadow-sm"><table className="w-full text-sm"><thead><tr className="text-left"><th>Sinh viên</th><th>Yêu cầu</th><th>Trạng thái</th><th>Feedback</th><th>Thao tác</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t"><td className="py-3">{item.student?.user?.fullName}</td><td>{item.title}</td><td>{item.status}</td><td><input value={feedback} onChange={(e) => setFeedback(e.target.value)} className="rounded-lg border px-2 py-1" placeholder="Feedback" /></td><td className="space-x-2"><button onClick={() => approve(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-white">Duyệt</button><button onClick={() => changes(item.id)} className="rounded-lg bg-amber-600 px-3 py-1 text-white">Yêu cầu sửa</button></td></tr>)}</tbody></table></div></div></>;
}
