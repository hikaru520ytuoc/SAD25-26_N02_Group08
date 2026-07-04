'use client';

import { FilePlus2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { useToast } from '@/components/providers/toast-provider';
import { StudentOutlineForm } from '@/components/sprint4/student-outline-form';
import { StudentOutlineStatusCard } from '@/components/sprint4/student-outline-status-card';
import { createOutline, getMyOutline, resubmitOutline } from '@/services/outlines.service';
import type { Outline } from '@/types/sprint4';
import type { OutlineFormValues } from '@/schemas/sprint4.schema';

export default function StudentOutlinePage() {
  const toast = useToast();
  const [outline, setOutline] = useState<Outline | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setOutline(await getMyOutline());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đề cương');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: OutlineFormValues) {
    if (outline?.status === 'NEEDS_REVISION') await resubmitOutline(outline.id, payload);
    else await createOutline(payload);
    setFormOpen(false);
    toast.success(outline?.status === 'NEEDS_REVISION' ? 'Đã nộp lại đề cương' : 'Đã nộp đề cương', 'Danh sách phiên bản và trạng thái đã được cập nhật.');
    await load(false);
  }

  const canSubmit = !outline || outline.status === 'NEEDS_REVISION';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đề cương của tôi"
        description="Theo dõi trạng thái và lịch sử xử lý đề cương. Form chỉ mở khi bạn chủ động nộp mới hoặc nộp lại."
        actions={canSubmit ? <button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><FilePlus2 className="h-4 w-4" />{outline ? 'Nộp lại đề cương' : 'Nộp đề cương'}</button> : undefined}
      />
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={3} /> : <StudentOutlineStatusCard outline={outline} />}
      {!loading && !canSubmit && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Đề cương hiện không ở trạng thái cho phép nộp mới hoặc nộp lại.</div>}
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={outline?.status === 'NEEDS_REVISION' ? 'Nộp lại đề cương' : 'Nộp đề cương'} description="Điền đầy đủ nội dung và tải file liên quan. Dữ liệu chỉ được reset sau khi gửi thành công." size="2xl">
        <StudentOutlineForm outline={outline} onSubmit={submit} />
      </FormModal>
    </div>
  );
}
