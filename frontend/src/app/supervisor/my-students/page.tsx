'use client';

import { useEffect, useState } from 'react';
import { SupervisorAssignmentTable } from '@/components/sprint3/supervisor-assignment-table';
import { getMyStudents } from '@/services/supervisor-assignments.service';
import type { SupervisorAssignment } from '@/types/sprint3';

export default function SupervisorMyStudentsPage() {
  const [items, setItems] = useState<SupervisorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setItems(await getMyStudents());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được sinh viên hướng dẫn');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Sinh viên tôi hướng dẫn</h1>
          <p className="mt-2 text-slate-600">Danh sách sinh viên đã được Khoa xác nhận GVHD chính thức.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : <SupervisorAssignmentTable items={items} mode="supervisor" />}
      </div>
    </>
  );
}
