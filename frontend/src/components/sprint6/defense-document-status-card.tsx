import { StatusBadge } from '@/components/common/status-badge';
import type { DefenseDocument } from '@/types/sprint6';

export function DefenseDocumentStatusCard({ document }: { document: DefenseDocument }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Trạng thái hồ sơ</h2>
          <p className="mt-2 text-slate-600">Nộp lúc {new Date(document.submittedAt).toLocaleString()}</p>
        </div>
        <StatusBadge value={document.status} />
      </div>
      {document.secretaryNote ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{document.secretaryNote}</p> : null}
      <div className="mt-4 text-sm text-slate-600">
        <p>Báo cáo: {document.reportFile?.originalName ?? 'Chưa có'}</p>
        <p>Slide: {document.slideFile?.originalName ?? 'Chưa có'}</p>
      </div>
    </div>
  );
}
