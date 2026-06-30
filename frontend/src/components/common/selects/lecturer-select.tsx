'use client';

import { useCallback } from 'react';
import { getLookupLecturers } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; role?: string; excludeLecturerId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function LecturerSelect({ value, onChange, role, excludeLecturerId, label = 'Giảng viên', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupLecturers({ role, excludeLecturerId }), [role, excludeLecturerId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn giảng viên" emptyText="Không có giảng viên phù hợp." disabled={disabled} error={error} required />;
}
