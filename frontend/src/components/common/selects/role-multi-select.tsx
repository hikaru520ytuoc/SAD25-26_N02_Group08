'use client';

import type { Role } from '@/types/auth';

type Props = {
  roles: Role[];
  value?: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

export function RoleMultiSelect({ roles, value = [], onChange, error }: Props) {
  function toggle(roleId: string) {
    onChange(value.includes(roleId) ? value.filter((id) => id !== roleId) : [...value, roleId]);
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">Vai trò <span className="text-rose-600">*</span></p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => toggle(role.id)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${value.includes(role.id) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="font-semibold">{role.code}</span>
            <span className="ml-2 text-xs text-slate-500">{role.name}</span>
          </button>
        ))}
      </div>
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
