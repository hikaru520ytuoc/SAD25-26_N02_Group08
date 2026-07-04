'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarCheck2, GraduationCap, UserCheck } from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { ProjectWorkflowStepper } from '@/components/common/project-workflow-stepper';
import { StatusBadge } from '@/components/common/status-badge';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { SupervisorAssignmentTable } from '@/components/sprint3/supervisor-assignment-table';
import { getMySupervisorAssignment } from '@/services/supervisor-assignments.service';
import type { SupervisorAssignment } from '@/types/sprint3';

export default function StudentSupervisorAssignmentPage() {
  const [items, setItems] = useState<SupervisorAssignment[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { setItems(await getMySupervisorAssignment()); } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được GVHD chính thức'); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  const active = useMemo(() => items.find((item) => item.status === 'ACTIVE') ?? items[0], [items]);
  return <div className="space-y-6"><PageHeader title="GVHD chính thức của tôi" description="Thông tin đề tài, giảng viên hướng dẫn và mốc bắt đầu workflow sau khi Khoa xác nhận phân công." />{error && <ErrorState message={error} onRetry={() => void load()} />}{loading ? <LoadingSkeleton rows={4} /> : !active ? <EmptyState title="Chưa có phân công GVHD" description="Phân công sẽ hiển thị sau khi Khoa chốt đề tài và giảng viên hướng dẫn." /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryStatCard label="Phân công đang hoạt động" value={items.filter((item) => item.status === 'ACTIVE').length} icon={UserCheck} tone="emerald" /><SummaryStatCard label="Đề tài" value={active.topic ? 1 : 0} icon={BookOpenCheck} tone="blue" /><SummaryStatCard label="Đợt đồ án" value={active.projectPeriod.semester || '—'} icon={CalendarCheck2} /><SummaryStatCard label="GVHD" value={active.supervisor.lecturerCode} icon={GraduationCap} tone="amber" /></div><article className="section-card"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Giảng viên hướng dẫn</p><h2 className="mt-1 text-2xl font-bold">{active.supervisor.user.fullName}</h2><p className="mt-1 text-sm text-slate-600">{active.supervisor.lecturerCode} · {active.supervisor.department || 'Chưa cập nhật đơn vị'}</p></div><StatusBadge value={active.status} /></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Đề tài</p><p className="mt-1 font-bold text-slate-950">{active.topic?.title ?? active.topicRegistration?.proposedTitle ?? 'Đề tài sinh viên đề xuất'}</p><p className="mt-3 text-sm text-slate-600">Đợt: <b>{active.projectPeriod.name}</b> · Phân công ngày {new Date(active.assignedAt).toLocaleDateString('vi-VN')}</p></div></article><ProjectWorkflowStepper /><SupervisorAssignmentTable items={items} mode="student" /></>}</div>;
}
