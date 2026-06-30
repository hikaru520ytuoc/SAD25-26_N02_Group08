import { AlertTriangle } from 'lucide-react';

export function ErrorState({ message = 'Có lỗi xảy ra.' }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
      <AlertTriangle className="mr-2 inline h-4 w-4" />
      {message}
    </div>
  );
}
