'use client';

import { BookCheck, BookOpen, CircleDashed, Plus, Send, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmActionModal } from '@/components/common/confirm-action-modal';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { TopicForm } from '@/components/sprint2/topic-form';
import { TopicTable } from '@/components/sprint2/topic-table';
import { createTopic, getMyTopics, submitTopic, updateTopic, type TopicInput } from '@/services/topics.service';
import type { Topic } from '@/types/sprint2';

export default function SupervisorTopicsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [submitTarget, setSubmitTarget] = useState<Topic | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setItems(await getMyTopics());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đề tài của giảng viên.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({ total: items.length, draft: items.filter((item) => item.status === 'DRAFT').length, submitted: items.filter((item) => item.status === 'SUBMITTED').length, approved: items.filter((item) => ['APPROVED', 'PUBLISHED'].includes(item.status)).length, rejected: items.filter((item) => item.status === 'REJECTED').length }), [items]);

  async function saveTopic(input: TopicInput) {
    setSaving(true);
    try {
      const result = editTopic ? await updateTopic(editTopic.id, input) : await createTopic(input);
      setItems((current) => editTopic ? current.map((item) => item.id === result.id ? result : item) : [result, ...current]);
      setFormOpen(false);
      setEditTopic(null);
      toast.success(editTopic ? 'Đã cập nhật đề tài' : 'Đã lưu bản nháp', 'Bạn có thể gửi duyệt khi nội dung đã hoàn thiện.');
    } catch (err) {
      toast.error('Không thể lưu đề tài', err instanceof Error ? err.message : 'Vui lòng kiểm tra dữ liệu.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function confirmSubmit() {
    if (!submitTarget) return;
    setActionLoadingId(submitTarget.id);
    try {
      const updated = await submitTopic(submitTarget.id);
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSubmitTarget(null);
      toast.success('Đã gửi đề tài để xét duyệt');
    } catch (err) {
      toast.error('Không thể gửi duyệt', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Đề tài của giảng viên hướng dẫn" description="Quản lý đề tài, theo dõi trạng thái xét duyệt và số lượng sinh viên đăng ký." actions={<button type="button" onClick={() => { setEditTopic(null); setFormOpen(true); }} className="primary-button"><Plus className="mr-2 h-4 w-4" />Tạo đề tài mới</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStatCard label="Tổng đề tài" value={counts.total} icon={BookOpen} />
        <SummaryStatCard label="Bản nháp" value={counts.draft} icon={CircleDashed} />
        <SummaryStatCard label="Chờ duyệt" value={counts.submitted} icon={Send} tone="amber" />
        <SummaryStatCard label="Đã duyệt/công bố" value={counts.approved} icon={BookCheck} tone="emerald" />
        <SummaryStatCard label="Đã từ chối" value={counts.rejected} icon={XCircle} tone="rose" />
      </div>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : <TopicTable topics={items} mode="supervisor" actionLoadingId={actionLoadingId} onSubmitTopic={setSubmitTarget} onEdit={(topic) => { setEditTopic(topic); setFormOpen(true); }} />}

      <FormModal open={formOpen} onClose={() => { setFormOpen(false); setEditTopic(null); }} title={editTopic ? 'Chỉnh sửa đề tài' : 'Tạo đề tài mới'} description="Form không chứa dữ liệu mẫu. Đề tài mới được lưu ở trạng thái bản nháp." closeDisabled={saving}>
        <TopicForm loading={saving} onSubmit={saveTopic} onCancel={() => { setFormOpen(false); setEditTopic(null); }} submitLabel={editTopic ? 'Lưu thay đổi' : 'Lưu bản nháp'} initialValues={editTopic ? { title: editTopic.title, description: editTopic.description, objectives: editTopic.objectives ?? '', expectedOutput: editTopic.expectedOutput ?? '', major: editTopic.major ?? '', maxStudents: editTopic.maxStudents, projectPeriodId: editTopic.projectPeriod.id } : null} />
      </FormModal>
      <ConfirmActionModal open={Boolean(submitTarget)} onClose={() => setSubmitTarget(null)} onConfirm={confirmSubmit} loading={Boolean(actionLoadingId)} title={submitTarget?.status === 'REJECTED' ? 'Gửi duyệt lại đề tài' : 'Gửi đề tài xét duyệt'} confirmLabel="Gửi duyệt" description={submitTarget ? <>Đề tài <strong>{submitTarget.title}</strong> sẽ chuyển sang trạng thái chờ Khoa xét duyệt. Trong thời gian chờ, chỉ nên chỉnh sửa khi thực sự cần thiết.</> : null} />
    </div>
  );
}
