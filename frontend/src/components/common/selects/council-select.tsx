'use client';

import { useCallback } from 'react';
import { getLookupCouncils } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; status?: string; projectPeriodId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function CouncilSelect({ value, onChange, status = 'ACTIVE', projectPeriodId, label = 'Hội đồng', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupCouncils({ status, projectPeriodId }), [status, projectPeriodId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn hội đồng" emptyText="Chưa có hội đồng ACTIVE phù hợp." disabled={disabled} error={error} required />;
}
