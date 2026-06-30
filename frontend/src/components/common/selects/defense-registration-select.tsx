'use client';

import { useCallback } from 'react';
import { getLookupDefenseRegistrations } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; status?: string; projectPeriodId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function DefenseRegistrationSelect({ value, onChange, status, projectPeriodId, label = 'Hồ sơ bảo vệ', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupDefenseRegistrations({ status, projectPeriodId }), [status, projectPeriodId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn hồ sơ bảo vệ" emptyText="Chưa có hồ sơ bảo vệ phù hợp." disabled={disabled} error={error} required />;
}
