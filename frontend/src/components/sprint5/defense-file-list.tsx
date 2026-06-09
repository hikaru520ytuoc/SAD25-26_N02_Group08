import type { DefenseRegistration } from '@/types/sprint5';
import { FileDownloadButton } from './file-download-button';

export function DefenseFileList({ registration }: { registration: DefenseRegistration }) {
  return (
    <div className="flex flex-wrap gap-2">
      <FileDownloadButton file={registration.reportFile} label="Báo cáo" />
      <FileDownloadButton file={registration.slideFile} label="Slide" />
      <FileDownloadButton file={registration.additionalDocumentFile} label="Tài liệu bổ sung" />
    </div>
  );
}
