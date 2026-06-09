'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { SupervisorAssignmentTable } from '@/components/sprint3/supervisor-assignment-table';
import { getSupervisorAssignments } from '@/services/supervisor-assignments.service';
import type { SupervisorAssignment } from '@/types/sprint3';

export default function FacultySupervisorAssignmentsPage() {
  const [items, setItems] = useState<SupervisorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setItems(await getSupervisorAssignments());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được phân công GVHD');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Danh sách phân công GVHD</h1>
          <p className="mt-2 text-slate-600">Khoa xem các phân công GVHD đã được xác nhận chính thức.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : <SupervisorAssignmentTable items={items} />}
      </div>
    </AppShell>
  );
}
