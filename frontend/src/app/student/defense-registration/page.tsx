'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DefenseRegistrationForm } from '@/components/sprint5/defense-registration-form';
import { DefenseRegistrationStatusCard } from '@/components/sprint5/defense-registration-status-card';
import { createDefenseRegistration, getMyDefenseRegistration, resubmitDefenseRegistration } from '@/services/defense-registrations.service';
import type { DefenseRegistration } from '@/types/sprint5';
import type { DefenseRegistrationValues } from '@/schemas/sprint5.schema';

export default function StudentDefenseRegistrationPage() {
  const [registration, setRegistration] = useState<DefenseRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setRegistration(await getMyDefenseRegistration());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(payload: DefenseRegistrationValues) {
    if (registration && ['NEEDS_REVISION', 'REVIEWER_NEEDS_REVISION'].includes(registration.status)) {
      await resubmitDefenseRegistration(registration.id, payload);
    } else {
      await createDefenseRegistration(payload);
    }
    await load();
  }

  const canSubmit = !registration || ['NEEDS_REVISION', 'REVIEWER_NEEDS_REVISION'].includes(registration.status);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Đăng ký bảo vệ</h1>
            <p className="mt-2 text-slate-600">Chỉ sinh viên có đề cương APPROVED mới đăng ký được bảo vệ.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <DefenseRegistrationStatusCard registration={registration} />
        {canSubmit ? <DefenseRegistrationForm onSubmit={submit} /> : <div className="rounded-3xl bg-white p-6 shadow-sm">Hồ sơ đã được xử lý, hiện không thể nộp mới.</div>}
      </div>
    </AppShell>
  );
}
