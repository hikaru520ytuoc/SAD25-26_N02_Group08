import { StatusBadge } from '@/components/common/status-badge';
import type { TopicRegistration } from '@/types/sprint3';

export function TopicRegistrationDetail({ item }: { item: TopicRegistration }) {
  const supervisor = item.supervisorAssignment?.supervisor.user.fullName
    ?? item.requestedSupervisor?.user.fullName
    ?? item.topic?.supervisor?.user?.fullName
    ?? 'Chưa phân công';
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-950">Thông tin chung</h3><StatusBadge value={item.status} /></div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Sinh viên</dt><dd className="mt-1 font-semibold text-slate-900">{item.student.studentCode} – {item.student.user.fullName}</dd></div>
          <div><dt className="text-slate-500">Lớp / ngành</dt><dd className="mt-1 font-semibold text-slate-900">{item.student.className} · {item.student.major.name}</dd></div>
          <div><dt className="text-slate-500">Đợt đồ án</dt><dd className="mt-1 font-semibold text-slate-900">{item.projectPeriod.name}</dd></div>
          <div><dt className="text-slate-500">Hình thức</dt><dd className="mt-1 font-semibold text-slate-900">{item.registrationType === 'EXISTING_TOPIC' ? 'Đề tài có sẵn' : 'Sinh viên đề xuất'}</dd></div>
          <div><dt className="text-slate-500">GVHD hiện tại</dt><dd className="mt-1 font-semibold text-slate-900">{supervisor}</dd></div>
          <div><dt className="text-slate-500">Ngày gửi</dt><dd className="mt-1 font-semibold text-slate-900">{new Date(item.createdAt).toLocaleString('vi-VN')}</dd></div>
        </dl>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-950">Nội dung đề tài</h3>
        <h4 className="mt-4 text-sm font-semibold text-slate-900">{item.topic?.title ?? item.proposedTitle}</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.topic?.description ?? item.proposedDescription ?? 'Chưa cập nhật.'}</p>
        {(item.topic?.objectives || item.proposedObjectives) && <><h4 className="mt-5 text-sm font-semibold text-slate-900">Mục tiêu</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.topic?.objectives ?? item.proposedObjectives}</p></>}
        {(item.topic?.expectedOutput || item.proposedExpectedOutput) && <><h4 className="mt-5 text-sm font-semibold text-slate-900">Sản phẩm dự kiến</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.topic?.expectedOutput ?? item.proposedExpectedOutput}</p></>}
      </section>
      {(item.supervisorResponseNote || item.facultyNote || item.rejectedReason) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-950">Phản hồi xử lý</h3>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {item.supervisorResponseNote && <p><strong>GVHD:</strong> {item.supervisorResponseNote}</p>}
            {item.facultyNote && <p><strong>Khoa:</strong> {item.facultyNote}</p>}
            {item.rejectedReason && <p className="text-rose-700"><strong>Lý do từ chối:</strong> {item.rejectedReason}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
