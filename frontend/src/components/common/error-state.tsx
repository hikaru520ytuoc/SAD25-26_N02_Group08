import { AlertTriangle, RotateCcw } from 'lucide-react';

export function ErrorState({ message = 'Có lỗi xảy ra.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p><AlertTriangle className="mr-2 inline h-4 w-4" />{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
            <RotateCcw className="h-4 w-4" />Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
