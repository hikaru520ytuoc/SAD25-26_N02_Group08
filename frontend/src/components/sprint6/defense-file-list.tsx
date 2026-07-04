'use client';

import { FileActions } from '@/components/common/file-actions';
import type { DefenseDocument } from '@/types/sprint6';

export function DefenseFileList({ document }: { document: DefenseDocument }) {
  const files = [document.reportFile, document.slideFile, document.additionalFile].filter(Boolean) as Array<{ id: string; originalName: string; mimeType?: string | null }>;
  if (!files.length) return <p className="text-sm text-slate-500">Chưa có file hồ sơ.</p>;
  return <div className="flex flex-wrap gap-3">{files.map((file) => <FileActions key={file.id} fileId={file.id} filename={file.originalName} mimeType={file.mimeType} compact />)}</div>;
}
