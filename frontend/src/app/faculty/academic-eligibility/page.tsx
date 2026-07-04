'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, GraduationCap, UserCheck, UserRoundX, XCircle } from 'lucide-react';
import { DetailDrawer } from '@/components/common/detail-drawer';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { getAcademicEligibilityOverview, type AcademicEligibilityOverviewItem } from '@/services/students.service';

const PAGE_SIZE = 12;
const internshipLabels: Record<string, string> = { NOT_COMPLETED: 'Chưa hoàn thành', COMPLETED: 'Đã hoàn thành', WAIVED: 'Được miễn' };

export default function FacultyStudentEligibilitiesPage() {
  const [items, setItems] = useState<AcademicEligibilityOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [majorCode, setMajorCode] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');
  const [selected, setSelected] = useState<AcademicEligibilityOverviewItem | null>(null);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAcademicEligibilityOverview({ search: search.trim() || undefined, majorCode: majorCode || undefined, eligible: eligibilityFilter === 'ALL' ? undefined : eligibilityFilter === 'ELIGIBLE' });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu điều kiện đăng ký đồ án.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [search, majorCode, eligibilityFilter]);
  useEffect(() => setPage(1), [search, majorCode, eligibilityFilter]);

  const stats = useMemo(() => ({ total: items.length, eligible: items.filter((item) => item.eligibility.eligible).length, ineligible: items.filter((item) => !item.eligibility.eligible).length, registered: items.filter((item) => Boolean(item.activeProjectPeriodRegistration)).length }), [items]);
  const majors = useMemo(() => Array.from(new Map(items.map((item) => [item.major.code, item.major])).values()).sort((a, b) => a.name.localeCompare(b.name, 'vi')), [items]);
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Điều kiện đăng ký đồ án" description="Theo dõi kết quả kiểm tra điều kiện học vụ theo dữ liệu thực tế. Sinh viên đủ điều kiện sẽ tự chọn một đợt đồ án đang mở trên tài khoản của mình." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard label="Tổng sinh viên" value={stats.total} icon={GraduationCap} />
        <SummaryStatCard label="Đủ điều kiện" value={stats.eligible} icon={UserCheck} tone="emerald" />
        <SummaryStatCard label="Chưa đủ điều kiện" value={stats.ineligible} icon={UserRoundX} tone="rose" />
        <SummaryStatCard label="Đã chọn đợt" value={stats.registered} tone="blue" />
      </div>

      <FilterBar>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã sinh viên, họ tên, email, lớp..." className="field-input min-w-[240px] flex-1" />
        <select value={majorCode} onChange={(event) => setMajorCode(event.target.value)} className="field-input min-w-56">
          <option value="">Tất cả ngành</option>
          {majors.map((major) => <option key={major.id} value={major.code}>{major.code} - {major.name}</option>)}
        </select>
        <select value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value as typeof eligibilityFilter)} className="field-input min-w-52">
          <option value="ALL">Tất cả kết quả</option><option value="ELIGIBLE">Đủ điều kiện</option><option value="INELIGIBLE">Chưa đủ điều kiện</option>
        </select>
      </FilterBar>

      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {loading ? <LoadingSkeleton rows={5} /> : visible.length === 0 ? <EmptyState title="Không tìm thấy sinh viên" description="Thử thay đổi từ khóa hoặc bộ lọc điều kiện." /> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((item) => (
            <article key={item.id} className="section-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-bold text-slate-950">{item.studentCode} – {item.user.fullName}</h2><p className="mt-1 text-sm text-slate-500">{item.className} · {item.major.code} - {item.major.name}</p></div>
                <EligibilityBadge eligible={item.eligibility.eligible} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Metric label="Tín chỉ" value={`${item.accumulatedCredits}/${item.eligibility.requiredCredits}`} passed={item.eligibility.checks.credits} />
                <Metric label="GPA" value={item.gpa.toFixed(2)} passed={item.eligibility.checks.gpa} />
                <Metric label="Thực tập" value={internshipLabels[item.internshipStatus] ?? 'Chưa xác định'} passed={item.eligibility.checks.internship} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>{item.activeProjectPeriodRegistration ? <StatusBadge value={item.activeProjectPeriodRegistration.status} /> : <span className="text-sm text-slate-400">Chưa đăng ký đợt</span>}</div>
                <button type="button" onClick={() => setSelected(item)} className="secondary-button"><Eye className="mr-1.5 h-4 w-4" />Xem chi tiết</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && items.length > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={items.length} onPageChange={setPage} />}

      <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.studentCode} – ${selected.user.fullName}` : 'Chi tiết điều kiện'} description="Kết quả được tính trực tiếp từ hồ sơ học vụ hiện tại.">
        {selected && <div className="space-y-5">
          <section className="section-card"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-950">Thông tin chung</h3><EligibilityBadge eligible={selected.eligibility.eligible} /></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Info label="Email" value={selected.user.email} /><Info label="Lớp" value={selected.className} /><Info label="Ngành" value={`${selected.major.code} - ${selected.major.name}`} /><Info label="Trạng thái học tập" node={<StatusBadge value={selected.academicStatus} />} /></dl></section>
          <section className="section-card"><h3 className="font-bold text-slate-950">Các tiêu chí</h3><div className="mt-4 space-y-3"><Condition passed={selected.eligibility.checks.credits} label={`Tín chỉ tích lũy: ${selected.accumulatedCredits}/${selected.eligibility.requiredCredits}`} /><Condition passed={selected.eligibility.checks.gpa} label={`GPA: ${selected.gpa.toFixed(2)} / tối thiểu 2,50`} /><Condition passed={selected.eligibility.checks.internship} label={`Thực tập: ${internshipLabels[selected.internshipStatus] ?? 'Chưa xác định'}`} /><Condition passed={selected.eligibility.checks.prerequisiteDebt} label="Không nợ môn tiên quyết" /><Condition passed={selected.eligibility.checks.tuitionDebt} label="Không nợ học phí" /><Condition passed={selected.eligibility.checks.disciplinaryAction} label="Không bị kỷ luật" /><Condition passed={selected.eligibility.checks.academicStatus} label="Trạng thái học tập hợp lệ" /></div>{!selected.eligibility.eligible && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700"><strong>Lý do chưa đủ điều kiện:</strong><ul className="mt-2 list-disc space-y-1 pl-5">{selected.eligibility.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}</section>
          <section className="section-card"><h3 className="font-bold text-slate-950">Đợt đồ án đã chọn</h3>{selected.activeProjectPeriodRegistration ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{selected.activeProjectPeriodRegistration.projectPeriod.name}</p><p className="mt-1 text-sm text-slate-500">Đăng ký ngày {new Date(selected.activeProjectPeriodRegistration.registeredAt).toLocaleDateString('vi-VN')}</p></div><StatusBadge value={selected.activeProjectPeriodRegistration.status} /></div> : <p className="mt-3 text-sm text-slate-500">Sinh viên chưa chọn đợt đồ án.</p>}</section>
        </div>}
      </DetailDrawer>
    </div>
  );
}

function EligibilityBadge({ eligible }: { eligible: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{eligible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{eligible ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}</span>; }
function Metric({ label, value, passed }: { label: string; value: string; passed: boolean }) { return <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 font-bold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>{value}</p></div>; }
function Condition({ passed, label }: { passed: boolean; label: string }) { return <p className={`flex items-start gap-2 rounded-2xl px-3 py-2 text-sm ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}{label}</p>; }
function Info({ label, value, node }: { label: string; value?: string; node?: React.ReactNode }) { return <div><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{node ?? value ?? '-'}</dd></div>; }
