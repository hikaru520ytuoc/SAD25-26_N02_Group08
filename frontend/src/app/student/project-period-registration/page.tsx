'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { confirmImportantAction } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import {
  cancelProjectPeriodRegistration,
  getAvailableProjectPeriods,
  registerProjectPeriod,
  type AvailableProjectPeriodsResult,
} from '@/services/project-period-registrations.service';

function formatDate(value?: string | null) {
  if (!value) return 'Không giới hạn';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

export default function StudentProjectPeriodRegistrationPage() {
  const [data, setData] = useState<AvailableProjectPeriodsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await getAvailableProjectPeriods());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đợt đồ án.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleRegister(projectPeriodId: string, periodName: string) {
    if (!confirmImportantAction(`Xác nhận đăng ký tham gia “${periodName}”? Sau khi đăng ký đề tài, bạn sẽ không thể tự hủy đợt.`)) return;
    setActionId(projectPeriodId);
    setError(null);
    setSuccess(null);
    try {
      await registerProjectPeriod(projectPeriodId);
      setSuccess('Đăng ký đợt đồ án thành công. Bạn có thể chuyển sang đăng ký đề tài.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng ký đợt đồ án.');
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel() {
    const active = data?.activeRegistration;
    if (!active || !confirmImportantAction(`Hủy đăng ký “${active.projectPeriod.name}”?`)) return;
    setActionId(active.id);
    setError(null);
    setSuccess(null);
    try {
      await cancelProjectPeriodRegistration(active.id);
      setSuccess('Đã hủy đăng ký đợt đồ án.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy đăng ký đợt đồ án.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Đăng ký đợt đồ án</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Hệ thống tự đánh giá hồ sơ học vụ. Khi đủ điều kiện, bạn được tự chọn một đợt đang mở; hệ thống không tự gán bạn vào bất kỳ đợt nào.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {loading || !data ? (
        <div className="rounded-3xl bg-white p-8 text-sm text-slate-500 shadow-sm">Đang kiểm tra điều kiện học vụ...</div>
      ) : (
        <>
          <EligibilityCard data={data} />

          {data.activeRegistration ? (
            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-950">Đợt đồ án đang tham gia</h2>
                    <StatusBadge value={data.activeRegistration.status} />
                  </div>
                  <p className="mt-2 font-semibold text-blue-950">{data.activeRegistration.projectPeriod.name}</p>
                  <p className="mt-1 text-sm text-blue-800">
                    {data.activeRegistration.projectPeriod.semester} · {data.activeRegistration.projectPeriod.academicYear} · Đăng ký ngày {formatDate(data.activeRegistration.registeredAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/student/topic-registration" className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">Tiếp tục đăng ký đề tài</Link>
                  <button onClick={handleCancel} disabled={actionId === data.activeRegistration.id} className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50">
                    {actionId === data.activeRegistration.id ? 'Đang hủy...' : 'Hủy đăng ký đợt'}
                  </button>
                </div>
              </div>
            </section>
          ) : data.eligibility.eligible ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Các đợt đang mở</h2>
                <p className="mt-1 text-sm text-slate-500">Bạn chỉ được có một đăng ký đợt đang hoạt động.</p>
              </div>
              {data.periods.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Hiện không có đợt đồ án nào đang mở trong thời gian đăng ký.</div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {data.periods.map((period) => (
                    <article key={period.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="rounded-2xl bg-blue-50 p-3 text-blue-700"><CalendarDays className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{period.name}</h3><StatusBadge value={period.status} /></div>
                          <p className="mt-1 text-sm text-slate-600">{period.semester} · {period.academicYear}</p>
                          <dl className="mt-4 grid gap-2 text-sm text-slate-600">
                            <div className="flex justify-between gap-4"><dt>Bắt đầu đợt</dt><dd className="font-medium text-slate-900">{formatDate(period.startDate)}</dd></div>
                            <div className="flex justify-between gap-4"><dt>Kết thúc đợt</dt><dd className="font-medium text-slate-900">{formatDate(period.endDate)}</dd></div>
                            <div className="flex justify-between gap-4"><dt>Hạn đăng ký</dt><dd className="font-medium text-slate-900">{formatDate(period.registrationEndDate)}</dd></div>
                          </dl>
                          <button onClick={() => handleRegister(period.id, period.name)} disabled={actionId === period.id} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                            {actionId === period.id ? 'Đang đăng ký...' : 'Đăng ký tham gia đợt'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
              <h2 className="text-xl font-bold text-rose-950">Bạn chưa đủ điều kiện chọn đợt đồ án</h2>
              <p className="mt-2 text-sm text-rose-800">Danh sách đợt được ẩn cho đến khi hồ sơ học vụ đạt toàn bộ điều kiện.</p>
              <ul className="mt-4 space-y-2 text-sm text-rose-800">
                {data.eligibility.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EligibilityCard({ data }: { data: AvailableProjectPeriodsResult }) {
  const e = data.eligibility;
  const checks = [
    { label: `Tín chỉ tích lũy đạt ${e.requiredCredits} tín chỉ`, passed: e.checks.credits },
    { label: `GPA đạt tối thiểu ${e.minimumGpa.toFixed(1)}`, passed: e.checks.gpa },
    { label: 'Đã hoàn thành hoặc được miễn thực tập', passed: e.checks.internship },
    { label: 'Trạng thái học tập đang hoạt động', passed: e.checks.academicStatus },
    { label: 'Không nợ môn tiên quyết', passed: e.checks.prerequisiteDebt },
    { label: 'Không nợ học phí', passed: e.checks.tuitionDebt },
    { label: 'Không bị kỷ luật', passed: e.checks.disciplinaryAction },
    { label: 'Tài khoản đang hoạt động', passed: e.checks.accountStatus },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Kết quả điều kiện học vụ</h2>
          <p className="mt-1 text-sm text-slate-500">Ngưỡng tín chỉ được tính bằng 80% tổng tín chỉ ngành và làm tròn lên.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${e.eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {e.eligible ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {e.eligible ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {checks.map((check) => (
          <div key={check.label} className={`rounded-2xl border p-3 text-sm ${check.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            <p className="flex gap-2">{check.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}{check.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
