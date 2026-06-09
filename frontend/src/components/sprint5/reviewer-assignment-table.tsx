'use client';

import { useState } from 'react';
import { createReviewerAssignment } from '@/services/reviewers.service';
import type { DefenseRegistration, ReviewerAssignment } from '@/types/sprint5';

export function ReviewerAssignmentTable({ defenseItems, assignments, onChanged }: { defenseItems: DefenseRegistration[]; assignments: ReviewerAssignment[]; onChanged: () => Promise<void> }) {
  const [reviewerIdById, setReviewerIdById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  async function assign(defenseRegistrationId: string) {
    try {
      const reviewerId = reviewerIdById[defenseRegistrationId];
      if (!reviewerId) throw new Error('Nhập reviewerId/lecturerId của GVPB');
      await createReviewerAssignment({ defenseRegistrationId, reviewerId });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Phân công thất bại');
    }
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Hồ sơ đã được GVHD xác nhận</h2>
        <p className="mt-1 text-sm text-slate-600">Nhập lecturerId của GVPB. Không được trùng GVHD.</p>
        <div className="mt-4 space-y-3">
          {defenseItems.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-slate-600">Sinh viên: {item.student.user.fullName} · GVHD: {item.supervisor.user.fullName} · SupervisorId: {item.supervisor.id}</p>
              <div className="mt-3 flex gap-2">
                <input className="flex-1 rounded-xl border px-3 py-2" placeholder="reviewerId/lecturerId" value={reviewerIdById[item.id] ?? ''} onChange={(e) => setReviewerIdById({ ...reviewerIdById, [item.id]: e.target.value })} />
                <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={() => assign(item.id)}>Phân công GVPB</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Phân công hiện có</h2>
        <div className="mt-4 space-y-3">
          {assignments.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4 text-sm">
              <p className="font-semibold">{item.defenseRegistration.title}</p>
              <p>Sinh viên: {item.student.user.fullName} · GVPB: {item.reviewer.user.fullName} · Trạng thái: {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
