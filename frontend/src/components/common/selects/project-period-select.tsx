'use client';

import { useCallback } from 'react';
import { getLookupProjectPeriods } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; status?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function ProjectPeriodSelect({ value, onChange, status, label = 'Đợt đồ án', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupProjectPeriods({ status }), [status]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn đợt đồ án" emptyText="Chưa có đợt đồ án phù hợp. Hãy tạo/mở đợt đồ án trước." disabled={disabled} error={error} required />;
}
