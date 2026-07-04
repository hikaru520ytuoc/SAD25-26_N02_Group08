'use client';

import { FileActions } from '@/components/common/file-actions';
import type { FileDocument } from '@/types/sprint4';

export function FileDownloadButton({ file }: { file?: FileDocument | null }) {
  if (!file) return <span className="text-sm text-slate-400">Không có file</span>;
  return <FileActions fileId={file.id} filename={file.originalName} mimeType={file.mimeType} compact />;
}
