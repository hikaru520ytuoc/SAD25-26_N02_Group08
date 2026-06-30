'use client';

import { useEffect, useState } from 'react';
import { SupervisorRequestTable } from '@/components/sprint3/supervisor-request-table';
import { getSupervisorPendingRequests, supervisorAcceptRegistration, supervisorRejectRegistration } from '@/services/topic-registrations.service';
import type { TopicRegistration } from '@/types/sprint3';

export default function SupervisorRegistrationRequestsPage() {
  const [items, setItems] = useState<TopicRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setItems(await getSupervisorPendingRequests());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được yêu cầu hướng dẫn');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function accept(id: string) {
    await supervisorAcceptRegistration(id);
    await loadData();
  }

  async function reject(id: string, reason: string) {
    await supervisorRejectRegistration(id, reason);
    await loadData();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Yêu cầu hướng dẫn</h1>
          <p className="mt-2 text-slate-600">GVHD đồng ý hoặc từ chối yêu cầu hướng dẫn của sinh viên.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : <SupervisorRequestTable items={items} onAccept={accept} onReject={reject} loading={loading} />}
      </div>
    </>
  );
}
