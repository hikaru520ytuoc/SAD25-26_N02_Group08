'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, UserCheck, UserPlus } from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { FilterBar } from '@/components/common/filter-bar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { ReviewerAssignmentTable } from '@/components/sprint5/reviewer-assignment-table';
import { getFacultyDefenseRegistrations } from '@/services/defense-registrations.service';
import { getReviewerAssignments } from '@/services/reviewers.service';
import type { DefenseRegistration, ReviewerAssignment } from '@/types/sprint5';

export default function FacultyReviewerAssignmentsPage() {
  const [defenseItems, setDefenseItems] = useState<DefenseRegistration[]>([]); const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]); const [tab, setTab] = useState<'UNASSIGNED' | 'ASSIGNED'>('UNASSIGNED'); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { const [defenses, assigns] = await Promise.all([getFacultyDefenseRegistrations(), getReviewerAssignments()]); setDefenseItems(defenses); setAssignments(assigns); } catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu phân công phản biện'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const unassigned = useMemo(() => defenseItems.filter((item) => item.status === 'APPROVED_BY_SUPERVISOR' && !assignments.some((assignment) => assignment.defenseRegistration.id === item.id && assignment.status !== 'CANCELLED')), [defenseItems, assignments]);
  return <div className="space-y-6"><PageHeader title="Phân công giảng viên phản biện" description="Chỉ hồ sơ đã được GVHD xác nhận mới được phân công. Danh sách lựa chọn tự loại GVHD hiện tại và xác nhận trước khi gửi thông báo." /><div className="grid gap-4 sm:grid-cols-3"><SummaryStatCard label="Hồ sơ đủ điều kiện" value={unassigned.length + assignments.length} icon={ClipboardList} /><SummaryStatCard label="Chưa phân công" value={unassigned.length} icon={UserPlus} tone="amber" onClick={() => setTab('UNASSIGNED')} /><SummaryStatCard label="Đã phân công" value={assignments.filter((item) => item.status !== 'CANCELLED').length} icon={UserCheck} tone="emerald" onClick={() => setTab('ASSIGNED')} /></div><div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2"><button type="button" onClick={() => setTab('UNASSIGNED')} className={tab === 'UNASSIGNED' ? 'tab-button-active' : 'tab-button'}>Chưa phân công ({unassigned.length})</button><button type="button" onClick={() => setTab('ASSIGNED')} className={tab === 'ASSIGNED' ? 'tab-button-active' : 'tab-button'}>Đã phân công ({assignments.length})</button></div><FilterBar search={search} onSearchChange={setSearch} placeholder="Tìm sinh viên, GVHD, GVPB hoặc đề tài..." resultCount={tab === 'UNASSIGNED' ? unassigned.length : assignments.length} />{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={5} /> : <ReviewerAssignmentTable defenseItems={unassigned} assignments={assignments} onChanged={load} tab={tab} search={search} />}</div>;
}
