'use client';

import { useEffect, useState } from 'react';
import { FileUpload } from '@/components/sprint4/file-upload';
import { getMyRevisions, submitRevision } from '@/services/revisions.service';
import type { RevisionRequest } from '@/types/sprint8';
import type { FileDocument } from '@/types/sprint4';

export default function StudentRevisionPage() {
  const [items, setItems] = useState<RevisionRequest[]>([]);
  const [error, setError] = useState('');
  const [fileId, setFileId] = useState('');
  const [note, setNote] = useState('');

  async function load() { try { setItems(await getMyRevisions()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được yêu cầu chỉnh sửa'); } }
  useEffect(() => { load(); }, []);

  async function handleSubmit(id: string) {
    try { await submitRevision(id, { reportFileId: fileId, note }); setFileId(''); setNote(''); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Nộp bản chỉnh sửa thất bại'); }
  }

  return <><div className="space-y-6"><h1 className="text-3xl font-bold">Chỉnh sửa sau bảo vệ</h1>{error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}{items.length === 0 && <div className="rounded-3xl bg-white p-6 shadow-sm">Không có yêu cầu chỉnh sửa.</div>}{items.map((item) => <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm space-y-4"><div className="flex justify-between"><div><h2 className="text-xl font-bold">{item.title}</h2><p className="text-slate-600">{item.description}</p><p className="text-sm text-slate-500">Trạng thái: {item.status}</p>{item.feedback && <p className="text-sm text-red-600">Feedback: {item.feedback}</p>}</div></div>{['PENDING_SUBMISSION','NEEDS_CHANGES'].includes(item.status) && <div className="space-y-3 rounded-2xl border p-4"><FileUpload fileType="REVISION_REPORT" onUploaded={(file: FileDocument) => setFileId(file.id)} /><textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-24 w-full rounded-xl border p-3" placeholder="Ghi chú bản chỉnh sửa" /><button onClick={() => handleSubmit(item.id)} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Nộp bản chỉnh sửa</button></div>}<div><h3 className="font-semibold">Lịch sử nộp</h3>{item.submissions?.map((sub) => <p key={sub.id} className="text-sm text-slate-600">Lần {sub.versionNumber} - {new Date(sub.submittedAt).toLocaleString()}</p>)}</div></div>)}</div></>;
}
