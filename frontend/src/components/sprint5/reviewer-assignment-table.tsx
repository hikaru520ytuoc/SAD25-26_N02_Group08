'use client';

import { useState } from 'react';
import { ReviewerSelect } from '@/components/common/selects';
import { createReviewerAssignment } from '@/services/reviewers.service';
import type { DefenseRegistration, ReviewerAssignment } from '@/types/sprint5';

export function ReviewerAssignmentTable({ defenseItems, assignments, onChanged }: { defenseItems: DefenseRegistration[]; assignments: ReviewerAssignment[]; onChanged: () => Promise<void> }) {
  const [reviewerIdById, setReviewerIdById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  async function assign(defenseRegistrationId: string, supervisorId?: string) {
    try {
      const reviewerId = reviewerIdById[defenseRegistrationId];
      if (!reviewerId) throw new Error('Vui lòng chọn GVPB.');
      if (supervisorId && reviewerId === supervisorId) throw new Error('GVPB không được trùng với GVHD.');
      await createReviewerAssignment({ defenseRegistrationId, reviewerId });
      setReviewerIdById((prev) => ({ ...prev, [defenseRegistrationId]: '' }));
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
        <p className="mt-1 text-sm text-slate-600">Chọn GVPB từ danh sách giảng viên phản biện. Hệ thống tự gửi reviewerId ẩn và loại GVHD hiện tại.</p>
        <div className="mt-4 space-y-3">
          {defenseItems.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-slate-600">Sinh viên: {item.student.user.fullName} · GVHD: {item.supervisor.user.fullName}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <ReviewerSelect
                  value={reviewerIdById[item.id] ?? ''}
                  excludeLecturerId={item.supervisor.id}
                  onChange={(value) => setReviewerIdById({ ...reviewerIdById, [item.id]: value })}
                  label="GVPB"
                />
                <button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={() => assign(item.id, item.supervisor.id)}>Phân công GVPB</button>
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
