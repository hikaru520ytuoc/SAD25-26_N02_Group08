import type { DefenseRegistration } from '@/types/sprint5';
import { downloadFileUrl } from '@/services/files.service';

export function DefenseRegistrationStatusCard({ registration }: { registration: DefenseRegistration | null }) {
  if (!registration) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có hồ sơ đăng ký bảo vệ.</div>;
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{registration.title}</h2>
          <p className="mt-1 text-sm text-slate-600">Trạng thái: <span className="font-semibold">{registration.status}</span></p>
          {registration.summary ? <p className="mt-3 text-sm text-slate-700">{registration.summary}</p> : null}
          {registration.supervisorFeedback ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">GVHD/GVPB phản hồi: {registration.supervisorFeedback}</p> : null}
        </div>
        {registration.supervisorScore ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Điểm GVHD: {registration.supervisorScore.score}</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {registration.reportFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(registration.reportFile.id)}>Tải báo cáo</a> : null}
        {registration.slideFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(registration.slideFile.id)}>Tải slide</a> : null}
        {registration.additionalDocumentFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(registration.additionalDocumentFile.id)}>Tải tài liệu bổ sung</a> : null}
      </div>
    </div>
  );
}
