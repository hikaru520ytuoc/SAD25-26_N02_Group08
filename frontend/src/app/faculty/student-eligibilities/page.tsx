'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { StudentEligibilityForm } from '@/components/sprint2/student-eligibility-form';
import { StudentEligibilityTable } from '@/components/sprint2/student-eligibility-table';
import { clearAccessToken } from '@/lib/auth-storage';
import { getMe } from '@/services/auth.service';
import { createStudentEligibility, getStudentEligibilities, type CreateStudentEligibilityInput } from '@/services/student-eligibilities.service';
import type { StudentEligibility } from '@/types/sprint2';

export default function FacultyStudentEligibilitiesPage() {
  const router = useRouter();
  const [items, setItems] = useState<StudentEligibility[]>([]);
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
      setItems(await getStudentEligibilities());
    } catch {
      clearAccessToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(input: CreateStudentEligibilityInput) {
    setSaving(true);
    try {
      await createStudentEligibility(input);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm sinh viên đủ điều kiện');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Danh sách sinh viên đủ điều kiện</h1>
          <p className="mt-2 text-slate-600">Hệ thống chỉ dùng trạng thái hoàn thành thực tập làm điều kiện đầu vào.</p>
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <StudentEligibilityForm onSubmit={handleCreate} loading={saving} />
        {loading ? <div className="rounded-3xl bg-white p-8">Đang tải...</div> : <StudentEligibilityTable items={items} />}
      </div>
    </AppShell>
  );
}
