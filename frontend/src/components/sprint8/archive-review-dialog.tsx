'use client';

import { useState } from 'react';
import type { ArchiveRecord } from '@/types/sprint8';

export function ArchiveReviewDialog({
  record,
  onApprove,
  onRequestSupplement,
}: {
  record: ArchiveRecord;
  onApprove: (record: ArchiveRecord) => Promise<void> | void;
  onRequestSupplement: (record: ArchiveRecord, reason: string) => Promise<void> | void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function approve() {
    if (!confirm('Xác nhận hồ sơ lưu trữ hợp lệ?')) return;
    try {
      setSubmitting(true);
      await onApprove(record);
    } finally {
      setSubmitting(false);
    }
  }

  async function supplement() {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cần bổ sung.');
      return;
    }
    if (!confirm('Xác nhận yêu cầu sinh viên bổ sung hồ sơ?')) return;
    try {
      setSubmitting(true);
      setError('');
      await onRequestSupplement(record, reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        placeholder="Lý do nếu cần bổ sung hồ sơ"
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={approve} disabled={submitting || record.status === 'LOCKED'} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Duyệt hồ sơ
        </button>
        <button type="button" onClick={supplement} disabled={submitting || record.status === 'LOCKED'} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Yêu cầu bổ sung
        </button>
      </div>
    </div>
  );
}
