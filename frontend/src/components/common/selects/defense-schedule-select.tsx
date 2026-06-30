'use client';

import { useCallback } from 'react';
import { getLookupDefenseSchedules } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; councilId?: string; studentId?: string; status?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function DefenseScheduleSelect({ value, onChange, councilId, studentId, status, label = 'Lịch bảo vệ', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupDefenseSchedules({ councilId, studentId, status }), [councilId, studentId, status]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn lịch bảo vệ" emptyText="Chưa có lịch bảo vệ phù hợp." disabled={disabled} error={error} required />;
}
