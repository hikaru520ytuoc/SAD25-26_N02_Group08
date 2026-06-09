'use client';

import { getAccessToken } from '@/lib/auth-storage';
import type { DefenseDocument } from '@/types/sprint6';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type DefenseFile = { id: string; originalName: string };

function DownloadButton({ file }: { file: DefenseFile }) {
  async function download() {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/files/${file.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      alert('Không thể tải file');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.originalName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={download} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Tải {file.originalName}</button>;
}

export function DefenseFileList({ document }: { document: DefenseDocument }) {
  const files = [document.reportFile, document.slideFile, document.additionalFile].filter(Boolean) as DefenseFile[];
  if (!files.length) return <p className="text-sm text-slate-500">Chưa có file hồ sơ.</p>;
  return <div className="flex flex-wrap gap-2">{files.map((file) => <DownloadButton key={file.id} file={file} />)}</div>;
}
