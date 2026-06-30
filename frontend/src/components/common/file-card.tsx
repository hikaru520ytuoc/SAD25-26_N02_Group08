import { FileText } from 'lucide-react';
import { formatDateTime, formatFileSize } from '@/lib/formatters';

export type FileCardData = {
  id?: string;
  originalName?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  size?: number | null;
  type?: string | null;
  uploadedBy?: { fullName?: string | null; email?: string | null } | null;
  createdAt?: string | null;
  versionNumber?: number | null;
};

export function FileCard({ file, action }: { file: FileCardData; action?: React.ReactNode }) {
  const name = file.originalName ?? file.filename ?? 'Tệp đã upload';
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-950">{name}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {file.type && <span>{file.type}</span>}
          <span>{formatFileSize(file.size)}</span>
          {file.versionNumber && <span>Phiên bản {file.versionNumber}</span>}
          {file.createdAt && <span>{formatDateTime(file.createdAt)}</span>}
          {file.uploadedBy && <span>{file.uploadedBy.fullName ?? file.uploadedBy.email}</span>}
        </div>
      </div>
      {action}
    </div>
  );
}
