'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DefenseDocumentStatusCard } from '@/components/sprint6/defense-document-status-card';
import { DefenseFileList } from '@/components/sprint6/defense-file-list';
import { SecretaryDocumentReviewDialog } from '@/components/sprint6/secretary-document-review-dialog';
import { approveDefenseDocument, getSecretaryDefenseDocuments, requestDefenseDocumentSupplement } from '@/services/defense-documents.service';
import type { DefenseDocument } from '@/types/sprint6';

export default function SecretaryDefenseDocumentsPage() {
  const [items, setItems] = useState<DefenseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setItems(await getSecretaryDefenseDocuments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ bảo vệ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function approve(id: string) {
    await approveDefenseDocument(id);
    await load();
  }

  async function request(id: string, note: string) {
    await requestDefenseDocumentSupplement(id, { secretaryNote: note });
    await load();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-950">Thư ký kiểm tra hồ sơ bảo vệ</h1><p className="mt-2 text-slate-600">Yêu cầu bổ sung hoặc xác nhận hồ sơ hợp lệ.</p></div><Link href="/dashboard" className="rounded-xl border px-4 py-2 text-sm font-semibold">Dashboard</Link></div>
        {loading ? <div className="rounded-3xl bg-white p-6">Đang tải...</div> : null}
        {error ? <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div> : null}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <DefenseDocumentStatusCard document={item} />
              <div className="mt-4"><DefenseFileList document={item} /></div>
              {item.status !== 'APPROVED' ? <div className="mt-4"><SecretaryDocumentReviewDialog document={item} onApprove={approve} onRequestSupplement={request} /></div> : null}
            </div>
          ))}
          {!items.length && !loading ? <div className="rounded-3xl bg-white p-6 text-slate-500">Chưa có hồ sơ cần kiểm tra.</div> : null}
        </div>
      </div>
    </>
  );
}
