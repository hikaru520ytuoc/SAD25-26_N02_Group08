'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/common/status-badge';
import { getAcademicEligibilityOverview, type AcademicEligibilityOverviewItem } from '@/services/students.service';

const internshipLabels: Record<string, string> = {
  NOT_COMPLETED: 'Chưa hoàn thành',
  COMPLETED: 'Đã hoàn thành',
  WAIVED: 'Được miễn',
};

export default function FacultyStudentEligibilitiesPage() {
  const [items, setItems] = useState<AcademicEligibilityOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [majorCode, setMajorCode] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAcademicEligibilityOverview({
        search: search.trim() || undefined,
        majorCode: majorCode || undefined,
        eligible: eligibilityFilter === 'ALL' ? undefined : eligibilityFilter === 'ELIGIBLE',
      });
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

  const stats = useMemo(() => ({
    total: items.length,
    eligible: items.filter((item) => item.eligibility.eligible).length,
    registered: items.filter((item) => Boolean(item.activeProjectPeriodRegistration)).length,
  }), [items]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Điều kiện đăng ký đồ án</h1>
        <p className="mt-2 max-w-4xl text-slate-600">
          Hệ thống tự tính trực tiếp từ hồ sơ học vụ. Ngưỡng tín chỉ bằng 80% tổng tín chỉ ngành, làm tròn lên; GPA tối thiểu 2,5; đồng thời phải hoàn thành thực tập, không nợ môn tiên quyết, không nợ học phí và không bị kỷ luật.
        </p>
        <p className="mt-2 text-sm font-medium text-blue-700">
          Trang này không gán sinh viên vào đợt đồ án. Sinh viên đủ điều kiện sẽ tự chọn một đợt đang mở trên tài khoản của mình.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Sinh viên đang hiển thị</p><p className="mt-2 text-3xl font-bold text-slate-950">{stats.total}</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Đủ điều kiện</p><p className="mt-2 text-3xl font-bold text-emerald-700">{stats.eligible}</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Đã tự chọn đợt</p><p className="mt-2 text-3xl font-bold text-blue-700">{stats.registered}</p></div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã sinh viên, họ tên, email, lớp..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <select value={majorCode} onChange={(event) => setMajorCode(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="">Tất cả ngành</option>
            <option value="KTPM">KTPM - Kỹ thuật phần mềm</option>
            <option value="CNTT">CNTT - Công nghệ thông tin</option>
          </select>
          <select value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value as typeof eligibilityFilter)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="ALL">Tất cả kết quả</option>
            <option value="ELIGIBLE">Đủ điều kiện</option>
            <option value="INELIGIBLE">Chưa đủ điều kiện</option>
          </select>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Đang tính điều kiện từ hồ sơ sinh viên...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Không tìm thấy sinh viên phù hợp bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Sinh viên</th>
                  <th className="px-5 py-4">Ngành</th>
                  <th className="px-5 py-4">Tín chỉ</th>
                  <th className="px-5 py-4">GPA</th>
                  <th className="px-5 py-4">Thực tập</th>
                  <th className="px-5 py-4">Điều kiện logic</th>
                  <th className="px-5 py-4">Kết quả</th>
                  <th className="px-5 py-4">Đợt đã chọn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{item.studentCode} - {item.user.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.className} · {item.user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{item.major.code}</p>
                      <p className="text-xs text-slate-500">{item.major.name} · {item.major.totalCredits} tín chỉ</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={item.eligibility.checks.credits ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                        {item.accumulatedCredits}/{item.eligibility.requiredCredits}
                      </p>
                      <p className="text-xs text-slate-500">Ngưỡng 80%, làm tròn lên</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={item.eligibility.checks.gpa ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{item.gpa.toFixed(2)}/2,50</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className={item.eligibility.checks.internship ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>{internshipLabels[item.internshipStatus] ?? item.internshipStatus}</p>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <Condition passed={item.eligibility.checks.prerequisiteDebt} label="Không nợ môn" />
                      <Condition passed={item.eligibility.checks.tuitionDebt} label="Không nợ học phí" />
                      <Condition passed={item.eligibility.checks.disciplinaryAction} label="Không bị kỷ luật" />
                      <Condition passed={item.eligibility.checks.academicStatus} label="Đang học" />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${item.eligibility.eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {item.eligibility.eligible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {item.eligibility.eligible ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'}
                      </span>
                      {!item.eligibility.eligible && <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">{item.eligibility.reasons.join('; ')}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {item.activeProjectPeriodRegistration ? (
                        <div>
                          <p className="font-medium text-slate-900">{item.activeProjectPeriodRegistration.projectPeriod.name}</p>
                          <div className="mt-1"><StatusBadge value={item.activeProjectPeriodRegistration.status} /></div>
                        </div>
                      ) : <span className="text-xs text-slate-400">Chưa tự đăng ký</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Condition({ passed, label }: { passed: boolean; label: string }) {
  return <p className={`mb-1 flex items-center gap-1 ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>{passed ? '✓' : '✕'} {label}</p>;
}
