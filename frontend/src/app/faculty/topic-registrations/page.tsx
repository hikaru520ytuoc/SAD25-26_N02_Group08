'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FacultyRegistrationTable } from '@/components/sprint3/faculty-registration-table';
import { facultyAssignSupervisor, facultyConfirmRegistration, facultyRejectRegistration, getAllTopicRegistrations, listSupervisorOptions } from '@/services/topic-registrations.service';
import type { LecturerOption, TopicRegistration } from '@/types/sprint3';

export default function FacultyTopicRegistrationsPage() {
  const [items, setItems] = useState<TopicRegistration[]>([]);
  const [supervisors, setSupervisors] = useState<LecturerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [registrations, supervisorOptions] = await Promise.all([getAllTopicRegistrations(), listSupervisorOptions()]);
      setItems(registrations);
      setSupervisors(supervisorOptions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được đăng ký đề tài');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function assign(id: string, supervisorId: string) {
    await facultyAssignSupervisor(id, supervisorId);
    await loadData();
  }

  async function confirm(id: string) {
    await facultyConfirmRegistration(id);
    await loadData();
  }

  async function reject(id: string, reason: string) {
    await facultyRejectRegistration(id, reason);
    await loadData();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Khoa xử lý đăng ký đề tài</h1>
          <p className="mt-2 text-slate-600">Phân công GVHD, xác nhận chính thức hoặc từ chối đăng ký/đề xuất.</p>
        </div>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : <FacultyRegistrationTable items={items} supervisors={supervisors} onAssign={assign} onConfirm={confirm} onReject={reject} loading={loading} />}
      </div>
    </AppShell>
  );
}
