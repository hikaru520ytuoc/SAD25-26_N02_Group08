import type { DefenseRegistration } from '@/types/sprint5';
import { FileActions } from '@/components/common/file-actions';
import { StatusBadge } from '@/components/common/status-badge';

export function DefenseRegistrationStatusCard({ registration }: { registration: DefenseRegistration | null }) {
  if (!registration) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có hồ sơ đăng ký bảo vệ.</div>;
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{registration.title}</h2>
          <div className="mt-2"><StatusBadge value={registration.status} /></div>
          {registration.summary ? <p className="mt-3 text-sm text-slate-700">{registration.summary}</p> : null}
          {registration.supervisorFeedback ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">GVHD/GVPB phản hồi: {registration.supervisorFeedback}</p> : null}
        </div>
        {registration.supervisorScore ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Điểm GVHD: {registration.supervisorScore.score}</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {registration.reportFile ? <FileActions fileId={registration.reportFile.id} filename={registration.reportFile.originalName} mimeType={registration.reportFile.mimeType} compact /> : null}
        {registration.slideFile ? <FileActions fileId={registration.slideFile.id} filename={registration.slideFile.originalName} mimeType={registration.slideFile.mimeType} compact /> : null}
        {registration.additionalDocumentFile ? <FileActions fileId={registration.additionalDocumentFile.id} filename={registration.additionalDocumentFile.originalName} mimeType={registration.additionalDocumentFile.mimeType} compact /> : null}
      </div>
    </div>
  );
}
