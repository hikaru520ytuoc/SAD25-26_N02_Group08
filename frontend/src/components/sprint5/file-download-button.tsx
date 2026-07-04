'use client';

import { FileActions } from '@/components/common/file-actions';
import type { FileDocument } from '@/types/sprint4';

export function FileDownloadButton({ file, label }: { file?: FileDocument | null; label?: string }) {
  if (!file) return null;
  return <div className="space-y-1"><span className="text-xs font-medium text-slate-500">{label ?? file.originalName}</span><FileActions fileId={file.id} filename={file.originalName} mimeType={file.mimeType} compact /></div>;
}
