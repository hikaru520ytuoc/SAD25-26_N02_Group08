import { LockKeyhole } from 'lucide-react';

export function LockedRecordBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
      <LockKeyhole className="h-3.5 w-3.5" />
      Hồ sơ đã khóa
    </div>
  );
}
