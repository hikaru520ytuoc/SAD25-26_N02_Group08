'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DefenseDocumentForm } from '@/components/sprint6/defense-document-form';
import { DefenseDocumentStatusCard } from '@/components/sprint6/defense-document-status-card';
import { StudentDefenseScheduleCard } from '@/components/sprint6/student-defense-schedule-card';
import { getMyDefenseDocuments, resubmitDefenseDocument, submitDefenseDocument } from '@/services/defense-documents.service';
import { getMyDefenseSchedules } from '@/services/defense-schedules.service';
import type { DefenseDocumentValues } from '@/schemas/sprint6.schema';
import type { DefenseDocument, DefenseSchedule } from '@/types/sprint6';

export default function StudentDefenseSchedulePage() {
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [documents, setDocuments] = useState<DefenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [scheduleItems, documentItems] = await Promise.all([getMyDefenseSchedules(), getMyDefenseDocuments()]);
      setSchedules(scheduleItems);
      setDocuments(documentItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch/hồ sơ bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const schedule = schedules[0];
  const document = documents.find((item) => item.defenseScheduleId === schedule?.id) ?? documents[0];

  async function submit(values: DefenseDocumentValues) {
    if (!schedule) return;
    if (document?.status === 'NEEDS_SUPPLEMENT') await resubmitDefenseDocument(document.id, values);
    else await submitDefenseDocument(schedule.id, values);
    await load();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-950">Lịch và hồ sơ bảo vệ</h1><p className="mt-2 text-slate-600">Xem lịch, nộp hoặc bổ sung hồ sơ bảo vệ.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        {!schedule && !loading ? <div className="rounded-3xl bg-white p-6 text-slate-500">Bạn chưa có lịch bảo vệ.</div> : null}
        {schedule ? <StudentDefenseScheduleCard schedule={schedule} /> : null}
        {document ? <DefenseDocumentStatusCard document={document} /> : null}
        {schedule && document?.status !== 'APPROVED' ? <DefenseDocumentForm onSubmit={submit} submitLabel={document?.status === 'NEEDS_SUPPLEMENT' ? 'Bổ sung hồ sơ' : 'Nộp hồ sơ'} /> : null}
      </div>
    </>
  );
}
