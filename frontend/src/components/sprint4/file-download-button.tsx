'use client';

import { getAccessToken } from '@/lib/auth-storage';
import type { FileDocument } from '@/types/sprint4';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function FileDownloadButton({ file }: { file?: FileDocument | null }) {
  if (!file) return <span className="text-sm text-slate-400">Không có file</span>;

  async function download() {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/files/${file?.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      alert('Không thể tải file');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.originalName ?? 'download';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      Tải {file.originalName}
    </button>
  );
}
