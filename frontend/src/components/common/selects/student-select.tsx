'use client';

import { useCallback } from 'react';
import { getLookupStudents } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; projectPeriodId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function StudentSelect({ value, onChange, projectPeriodId, label = 'Sinh viên', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupStudents({ projectPeriodId }), [projectPeriodId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn sinh viên" emptyText="Không có sinh viên phù hợp." disabled={disabled} error={error} required />;
}
