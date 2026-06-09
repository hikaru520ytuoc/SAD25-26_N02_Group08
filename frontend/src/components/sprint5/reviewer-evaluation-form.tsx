'use client';

import { useState } from 'react';
import { submitReviewerEvaluation } from '@/services/reviewers.service';
import { downloadFileUrl } from '@/services/files.service';
import type { ReviewerAssignment } from '@/types/sprint5';

export function ReviewerEvaluationForm({ assignments, onChanged }: { assignments: ReviewerAssignment[]; onChanged: () => Promise<void> }) {
  const [commentById, setCommentById] = useState<Record<string, string>>({});
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({});
  const [scoreById, setScoreById] = useState<Record<string, string>>({});
  const [statusById, setStatusById] = useState<Record<string, 'ELIGIBLE_FOR_DEFENSE' | 'NOT_ELIGIBLE_FOR_DEFENSE'>>({});
  const [error, setError] = useState('');

  async function submit(item: ReviewerAssignment) {
    try {
      await submitReviewerEvaluation({
        reviewerAssignmentId: item.id,
        comment: commentById[item.id] ?? '',
        eligibilityStatus: statusById[item.id] ?? 'ELIGIBLE_FOR_DEFENSE',
        feedbackToStudent: feedbackById[item.id],
        score: scoreById[item.id] ? Number(scoreById[item.id]) : undefined,
        scoreComment: 'Điểm phản biện Sprint 5',
      });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi nhận xét thất bại');
    }
  }

  if (!assignments.length) return <div className="rounded-3xl bg-white p-6 shadow-sm">Chưa có phân công phản biện.</div>;

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div> : null}
      {assignments.map((item) => (
        <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-950">{item.defenseRegistration.title}</h3>
          <p className="text-sm text-slate-600">Sinh viên: {item.student.user.fullName} · GVHD: {item.supervisor.user.fullName}</p>
          <div className="mt-3 flex gap-2 text-sm">
            {item.defenseRegistration.reportFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(item.defenseRegistration.reportFile.id)}>Báo cáo</a> : null}
            {item.defenseRegistration.slideFile ? <a className="rounded-xl border px-3 py-2" href={downloadFileUrl(item.defenseRegistration.slideFile.id)}>Slide</a> : null}
          </div>
          <textarea className="mt-4 w-full rounded-xl border px-3 py-2" placeholder="Nhận xét phản biện" value={commentById[item.id] ?? item.evaluation?.comment ?? ''} onChange={(e) => setCommentById({ ...commentById, [item.id]: e.target.value })} />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input className="rounded-xl border px-3 py-2" placeholder="Điểm phản biện 0-10" value={scoreById[item.id] ?? ''} onChange={(e) => setScoreById({ ...scoreById, [item.id]: e.target.value })} />
            <select className="rounded-xl border px-3 py-2" value={statusById[item.id] ?? 'ELIGIBLE_FOR_DEFENSE'} onChange={(e) => setStatusById({ ...statusById, [item.id]: e.target.value as 'ELIGIBLE_FOR_DEFENSE' | 'NOT_ELIGIBLE_FOR_DEFENSE' })}>
              <option value="ELIGIBLE_FOR_DEFENSE">Đủ điều kiện</option>
              <option value="NOT_ELIGIBLE_FOR_DEFENSE">Chưa đủ điều kiện</option>
            </select>
            <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" onClick={() => submit(item)}>Gửi phản biện</button>
          </div>
          <input className="mt-3 w-full rounded-xl border px-3 py-2" placeholder="Feedback cho sinh viên nếu chưa đủ điều kiện" value={feedbackById[item.id] ?? ''} onChange={(e) => setFeedbackById({ ...feedbackById, [item.id]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}
