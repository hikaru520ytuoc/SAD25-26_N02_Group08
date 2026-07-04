'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route rendering error', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">Không thể hiển thị trang này</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Dữ liệu trả về chưa đầy đủ hoặc giao diện gặp lỗi khi xử lý. Hãy thử tải lại trang. Nếu lỗi tiếp tục xảy ra, mở Console để lấy thông tin chi tiết.
        </p>
        <button type="button" onClick={reset} className="primary-button mt-6">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Thử tải lại
        </button>
      </section>
    </main>
  );
}
