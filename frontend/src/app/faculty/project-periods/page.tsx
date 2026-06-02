'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ProjectPeriodForm } from '@/components/sprint2/project-period-form';
import { ProjectPeriodTable } from '@/components/sprint2/project-period-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { closeProjectPeriod, createProjectPeriod, getProjectPeriods, openProjectPeriod, type ProjectPeriodInput } from '@/services/project-periods.service';
import type { ProjectPeriod } from '@/types/sprint2';

export default function FacultyProjectPeriodsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ProjectPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const me = await getMe();
      if (!me.roles.includes('FACULTY_MANAGER') && !me.roles.includes('ADMIN')) {
        setError('Bạn không có quyền truy cập màn hình này.');
        return;
      }
      setItems(await getProjectPeriods());
    } catch (err) {
      clearAccessToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(input: ProjectPeriodInput) {
    setSaving(true);
    try {
      await createProjectPeriod(input);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đợt đồ án');
    } finally {
      setSaving(false);
    }
  }

  async function handleOpen(id: string) { await openProjectPeriod(id); await load(); }
  async function handleClose(id: string) { await closeProjectPeriod(id); await load(); }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Quản lý đợt đồ án</h1>
          <p className="mt-2 text-slate-600">Sprint 2: Faculty Manager tạo, mở và đóng đợt đồ án.</p>
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <ProjectPeriodForm onSubmit={handleCreate} loading={saving} />
        {loading ? <div className="rounded-3xl bg-white p-8">Đang tải...</div> : <ProjectPeriodTable periods={items} onOpen={handleOpen} onClose={handleClose} />}
      </div>
    </AppShell>
  );
}
