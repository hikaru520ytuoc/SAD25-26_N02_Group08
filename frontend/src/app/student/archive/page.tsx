'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FileUpload } from '@/components/sprint4/file-upload';
import { getMyArchives, resubmitArchive, submitArchive } from '@/services/archives.service';
import type { ArchiveRecord } from '@/types/sprint8';
import type { FileDocument } from '@/types/sprint4';

export default function StudentArchivePage() {
  const [items, setItems] = useState<ArchiveRecord[]>([]);
  const [error, setError] = useState('');
  const [finalReportFileId, setFinalReportFileId] = useState('');
  const [finalSlideFileId, setFinalSlideFileId] = useState('');
  const [sourceCodeFileId, setSourceCodeFileId] = useState('');
  const [archiveNote, setArchiveNote] = useState('');
  async function load() { try { setItems(await getMyArchives()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được hồ sơ lưu trữ'); } }
  useEffect(() => { load(); }, []);
  async function submit(record?: ArchiveRecord) { const values = { finalReportFileId, finalSlideFileId: finalSlideFileId || undefined, sourceCodeFileId: sourceCodeFileId || undefined, archiveNote }; record?.id ? await resubmitArchive(record.id, values) : await submitArchive(values); await load(); }
  const current = items[0];
  return <AppShell><div className="space-y-6"><h1 className="text-3xl font-bold">Hồ sơ lưu trữ cuối cùng</h1>{error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}{current && <div className="rounded-3xl bg-white p-6 shadow-sm"><p>Trạng thái: <b>{current.status}</b></p>{current.supplementReason && <p className="text-red-600">Lý do bổ sung: {current.supplementReason}</p>}{current.status === 'LOCKED' && <p className="text-emerald-700">Hồ sơ đã khóa, chỉ được tra cứu.</p>}</div>}{(!current || current.status === 'NEEDS_SUPPLEMENT' || current.status === 'NOT_SUBMITTED') && <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4"><h2 className="text-xl font-bold">Nộp hồ sơ</h2><label className="font-semibold">Báo cáo cuối cùng</label><FileUpload fileType="FINAL_REPORT" onUploaded={(f: FileDocument) => setFinalReportFileId(f.id)} /><label className="font-semibold">Slide</label><FileUpload fileType="FINAL_SLIDE" onUploaded={(f: FileDocument) => setFinalSlideFileId(f.id)} /><label className="font-semibold">Mã nguồn/file nén</label><FileUpload fileType="SOURCE_CODE" onUploaded={(f: FileDocument) => setSourceCodeFileId(f.id)} /><textarea value={archiveNote} onChange={(e) => setArchiveNote(e.target.value)} className="w-full rounded-xl border p-3" placeholder="Ghi chú" /><button onClick={() => submit(current)} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Nộp hồ sơ</button></div>}</div></AppShell>;
}
