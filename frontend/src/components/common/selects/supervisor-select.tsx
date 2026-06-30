'use client';

import { useCallback } from 'react';
import { getLookupSupervisors } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; label?: string; disabled?: boolean; error?: string; className?: string; optional?: boolean };

export function SupervisorSelect({ value, onChange, label = 'GVHD', disabled, error, className, optional }: Props) {
  const loadOptions = useCallback(() => getLookupSupervisors(), []);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder={optional ? 'Không chọn, để Khoa phân công' : 'Chọn GVHD'} emptyText="Không có GVHD phù hợp." disabled={disabled} error={error} />;
}
