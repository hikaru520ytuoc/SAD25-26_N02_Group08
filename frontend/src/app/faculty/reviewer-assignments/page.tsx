'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReviewerAssignmentTable } from '@/components/sprint5/reviewer-assignment-table';
import { getFacultyDefenseRegistrations } from '@/services/defense-registrations.service';
import { getReviewerAssignments } from '@/services/reviewers.service';
import type { DefenseRegistration, ReviewerAssignment } from '@/types/sprint5';

export default function FacultyReviewerAssignmentsPage() {
  const [defenseItems, setDefenseItems] = useState<DefenseRegistration[]>([]);
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [defenses, assigns] = await Promise.all([getFacultyDefenseRegistrations(), getReviewerAssignments()]);
      setDefenseItems(defenses.filter((item) => ['APPROVED_BY_SUPERVISOR', 'SENT_TO_REVIEWER', 'READY_FOR_COUNCIL'].includes(item.status)));
      setAssignments(assigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu phân công phản biện');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Khoa phân công GVPB</h1>
            <p className="mt-2 text-slate-600">Chỉ phân công phản biện cho hồ sơ đã được GVHD xác nhận đủ điều kiện.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <ReviewerAssignmentTable defenseItems={defenseItems} assignments={assignments} onChanged={load} />
      </div>
    </>
  );
}
