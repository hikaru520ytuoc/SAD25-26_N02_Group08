import { downloadFileUrl } from '@/services/files.service';
import type { FileDocument } from '@/types/sprint4';

export function FileDownloadButton({ file, label }: { file?: FileDocument | null; label?: string }) {
  if (!file) return null;
  return <a href={downloadFileUrl(file.id)} className="rounded-xl border px-3 py-2 text-sm font-semibold">{label ?? file.originalName}</a>;
}
