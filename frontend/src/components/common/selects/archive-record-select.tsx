'use client';

import { useCallback } from 'react';
import { getLookupArchiveRecords } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; status?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function ArchiveRecordSelect({ value, onChange, status, label = 'Hồ sơ lưu trữ', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupArchiveRecords({ status }), [status]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn hồ sơ lưu trữ" emptyText="Chưa có hồ sơ lưu trữ phù hợp." disabled={disabled} error={error} required />;
}
