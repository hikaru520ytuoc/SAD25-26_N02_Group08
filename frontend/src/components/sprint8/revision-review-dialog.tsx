'use client';

import { useState } from 'react';
import type { RevisionRequest } from '@/types/sprint8';

export function RevisionReviewDialog({
  request,
  onApprove,
  onRequestChanges,
}: {
  request: RevisionRequest;
  onApprove: (request: RevisionRequest) => Promise<void> | void;
  onRequestChanges: (request: RevisionRequest, feedback: string) => Promise<void> | void;
}) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function approve() {
    if (!confirm('Xác nhận duyệt bản chỉnh sửa này?')) return;
    try {
      setSubmitting(true);
      await onApprove(request);
    } finally {
      setSubmitting(false);
    }
  }

  async function requestChanges() {
    if (!feedback.trim()) {
      setError('Vui lòng nhập feedback khi yêu cầu chỉnh sửa lại.');
      return;
    }
    if (!confirm('Xác nhận yêu cầu sinh viên chỉnh sửa lại?')) return;
    try {
      setSubmitting(true);
      setError('');
      await onRequestChanges(request, feedback.trim());
      setFeedback('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        placeholder="Feedback nếu yêu cầu chỉnh sửa lại"
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={approve} disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Duyệt chỉnh sửa
        </button>
        <button type="button" onClick={requestChanges} disabled={submitting} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Yêu cầu sửa lại
        </button>
      </div>
    </div>
  );
}
