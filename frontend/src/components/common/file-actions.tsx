'use client';

import { Download, Eye, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FileViewerModal } from '@/components/common/file-viewer-modal';
import { useToast } from '@/components/providers/toast-provider';
import { getFileAccessUrl, getFileBlob, getFileErrorMessage, type FileAccessMode } from '@/services/files.service';

type PreviewState = { url: string; revokeOnClose?: boolean };

export function FileActions({ fileId, filename, mimeType, compact = false }: { fileId: string; filename?: string | null; mimeType?: string | null; compact?: boolean }) {
  const toast = useToast();
  const [loadingMode, setLoadingMode] = useState<FileAccessMode | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const previewSupported = mimeType === 'application/pdf' || Boolean(mimeType?.startsWith('image/')) || Boolean(mimeType?.startsWith('text/'));
  const inlineModal = Boolean(mimeType?.startsWith('image/')) || Boolean(mimeType?.startsWith('text/'));

  useEffect(() => () => { if (preview?.revokeOnClose) URL.revokeObjectURL(preview.url); }, [preview]);

  function closePreview() { if (preview?.revokeOnClose) URL.revokeObjectURL(preview.url); setPreview(null); }

  async function access(mode: FileAccessMode) {
    if (loadingMode) return;
    const previewWindow = mode === 'preview' && !inlineModal ? window.open('', '_blank', 'noopener,noreferrer') : null;
    setLoadingMode(mode);
    try {
      const accessUrl = await getFileAccessUrl(fileId, mode);
      if (mode === 'preview') {
        if (inlineModal) setPreview({ url: accessUrl.url });
        else if (previewWindow) previewWindow.location.href = accessUrl.url;
        else window.open(accessUrl.url, '_blank', 'noopener,noreferrer');
      } else {
        const anchor = document.createElement('a'); anchor.href = accessUrl.url; anchor.download = filename ?? 'download'; anchor.rel = 'noopener noreferrer'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      }
    } catch (signedUrlError) {
      previewWindow?.close();
      try {
        const blob = await getFileBlob(fileId); const objectUrl = URL.createObjectURL(blob);
        if (mode === 'preview' && previewSupported) {
          if (inlineModal) setPreview({ url: objectUrl, revokeOnClose: true });
          else window.open(objectUrl, '_blank', 'noopener,noreferrer');
        } else {
          const anchor = document.createElement('a'); anchor.href = objectUrl; anchor.download = filename ?? 'download'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        }
      } catch (fallbackError) { toast.error('Không thể truy cập file', getFileErrorMessage(fallbackError ?? signedUrlError)); }
    } finally { setLoadingMode(null); }
  }

  const buttonClass = compact ? 'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50' : 'inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';
  return <><div className="flex flex-wrap gap-2">{previewSupported && <button type="button" disabled={Boolean(loadingMode)} onClick={() => access('preview')} className={buttonClass}>{loadingMode === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}<span>{loadingMode === 'preview' ? 'Đang chuẩn bị...' : 'Xem'}</span></button>}<button type="button" disabled={Boolean(loadingMode)} onClick={() => access('download')} className={buttonClass}>{loadingMode === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}<span>{loadingMode === 'download' ? 'Đang chuẩn bị...' : 'Tải xuống'}</span></button></div><FileViewerModal open={Boolean(preview)} onClose={closePreview} url={preview?.url ?? ''} filename={filename} mimeType={mimeType} onDownload={() => void access('download')} /></>;
}
