'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReviewerEvaluationForm } from '@/components/sprint5/reviewer-evaluation-form';
import { getMyReviewerAssignments } from '@/services/reviewers.service';
import type { ReviewerAssignment } from '@/types/sprint5';

export default function ReviewerAssignmentsPage() {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setAssignments(await getMyReviewerAssignments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải phân công phản biện');
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
            <h1 className="text-3xl font-bold text-slate-950">GVPB phản biện đồ án</h1>
            <p className="mt-2 text-slate-600">Xem hồ sơ được phân công, nhập nhận xét, điểm phản biện và xác nhận điều kiện bảo vệ.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link>
        </div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <ReviewerEvaluationForm assignments={assignments} onChanged={load} />
      </div>
    </>
  );
}
