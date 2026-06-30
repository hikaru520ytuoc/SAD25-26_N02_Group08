'use client';

import { useCallback } from 'react';
import { getLookupFaculties } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; label?: string; disabled?: boolean; error?: string; className?: string; optional?: boolean };

export function FacultySelect({ value, onChange, label = 'Khoa', disabled, error, className, optional }: Props) {
  const loadOptions = useCallback(() => getLookupFaculties(), []);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder={optional ? 'Có thể bỏ trống' : 'Chọn khoa'} emptyText="Chưa có dữ liệu khoa." disabled={disabled} error={error} />;
}
