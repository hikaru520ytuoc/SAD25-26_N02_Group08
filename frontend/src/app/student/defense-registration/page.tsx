'use client';

import { FilePlus2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorState } from '@/components/common/error-state';
import { FormModal } from '@/components/common/form-modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { useToast } from '@/components/providers/toast-provider';
import { DefenseRegistrationForm } from '@/components/sprint5/defense-registration-form';
import { DefenseRegistrationStatusCard } from '@/components/sprint5/defense-registration-status-card';
import { createDefenseRegistration, getMyDefenseRegistration, resubmitDefenseRegistration } from '@/services/defense-registrations.service';
import type { DefenseRegistration } from '@/types/sprint5';
import type { DefenseRegistrationValues } from '@/schemas/sprint5.schema';

export default function StudentDefenseRegistrationPage() {
  const toast = useToast();
  const [registration, setRegistration] = useState<DefenseRegistration | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setRegistration(await getMyDefenseRegistration());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: DefenseRegistrationValues) {
    if (registration && ['NEEDS_REVISION', 'REVIEWER_NEEDS_REVISION'].includes(registration.status)) await resubmitDefenseRegistration(registration.id, payload);
    else await createDefenseRegistration(payload);
    setFormOpen(false);
    toast.success('Đã gửi hồ sơ bảo vệ', 'Trạng thái hồ sơ đã được cập nhật và gửi tới GVHD.');
    await load(false);
  }

  const canSubmit = !registration || ['NEEDS_REVISION', 'REVIEWER_NEEDS_REVISION'].includes(registration.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Đăng ký bảo vệ" description="Kiểm tra hồ sơ hiện tại và chỉ mở form khi cần tạo mới hoặc bổ sung." actions={canSubmit ? <button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><FilePlus2 className="h-4 w-4" />{registration ? 'Bổ sung hồ sơ' : 'Tạo hồ sơ đăng ký bảo vệ'}</button> : undefined} />
      {error && <ErrorState message={error} />}
      {loading ? <LoadingSkeleton rows={3} /> : <DefenseRegistrationStatusCard registration={registration} />}
      {!loading && !canSubmit && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Hồ sơ đã được xử lý, các thao tác nộp mới hiện được khóa.</div>}
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={registration ? 'Bổ sung hồ sơ bảo vệ' : 'Tạo hồ sơ đăng ký bảo vệ'} size="2xl">
        <DefenseRegistrationForm onSubmit={submit} />
      </FormModal>
    </div>
  );
}
