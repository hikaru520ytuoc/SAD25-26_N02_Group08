'use client';

import { useCallback } from 'react';
import { getLookupTopics } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; status?: string; projectPeriodId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function TopicSelect({ value, onChange, status = 'PUBLISHED', projectPeriodId, label = 'Đề tài', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupTopics({ status, projectPeriodId }), [status, projectPeriodId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn đề tài" emptyText="Chưa có đề tài phù hợp." disabled={disabled} error={error} required />;
}
