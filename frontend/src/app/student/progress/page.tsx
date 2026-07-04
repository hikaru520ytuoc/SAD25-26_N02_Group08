'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { SummaryStatCard } from '@/components/common/summary-stat-card';
import { useToast } from '@/components/providers/toast-provider';
import { StudentProgressForm } from '@/components/sprint4/student-progress-form';
import { StudentProgressList } from '@/components/sprint4/student-progress-list';
import { createProgress, getMyProgress } from '@/services/project-progress.service';
import type { ProgressFormValues } from '@/schemas/sprint4.schema';
import type { ProjectProgress } from '@/types/sprint4';

export default function StudentProgressPage() {
  const toast = useToast();
  const [progresses, setProgresses] = useState<ProjectProgress[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setProgresses(await getMyProgress());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tiến độ');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: ProgressFormValues) {
    await createProgress(payload);
    setFormOpen(false);
    toast.success('Đã thêm cập nhật tiến độ', 'Báo cáo mới đã xuất hiện trong danh sách.');
    await load(false);
  }

  const latestPercent = useMemo(() => progresses[0]?.progressPercent ?? 0, [progresses]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tiến độ đồ án" description="Theo dõi các lần cập nhật và phản hồi của GVHD." actions={<button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Thêm cập nhật tiến độ</button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStatCard label="Số lần cập nhật" value={progresses.length} />
        <SummaryStatCard label="Tiến độ gần nhất" value={`${latestPercent}%`} tone="blue" />
        <SummaryStatCard label="Đã có phản hồi" value={progresses.filter((item) => item.comments.length > 0).length} tone="emerald" />
      </div>
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={4} /> : <StudentProgressList progresses={progresses} />}
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title="Thêm cập nhật tiến độ" description="Ghi rõ nội dung đã làm, mức hoàn thành và tài liệu minh chứng nếu có." size="xl">
        <StudentProgressForm onSubmit={submit} />
      </FormModal>
    </div>
  );
}
