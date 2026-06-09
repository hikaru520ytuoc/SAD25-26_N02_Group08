'use client';

import type { DefenseRegistration } from '@/types/sprint5';
import { DefenseFileList } from './defense-file-list';

export function SupervisorDefenseReviewDialog({ registration }: { registration: DefenseRegistration }) {
  return (
    <div className="rounded-3xl border p-4">
      <h3 className="font-bold">{registration.title}</h3>
      <p className="text-sm text-slate-600">Sinh viên: {registration.student.user.fullName}</p>
      <div className="mt-3"><DefenseFileList registration={registration} /></div>
    </div>
  );
}
