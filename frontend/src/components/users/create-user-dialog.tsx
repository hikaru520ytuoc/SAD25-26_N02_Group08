'use client';

import { X } from 'lucide-react';
import { CreateUserForm } from './create-user-form';
import type { CreateUserFormValues } from '@/schemas/user.schema';
import type { Role } from '@/types/auth';

type Props = {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
};

export function CreateUserDialog({ open, roles, onClose, onSubmit }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Thêm tài khoản mới</h2>
            <p className="mt-1 text-sm text-slate-500">Tạo tài khoản và hồ sơ liên quan trong một bước.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 md:p-6">
          <CreateUserForm
            roles={roles}
            onSubmit={async (values) => {
              await onSubmit(values);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
