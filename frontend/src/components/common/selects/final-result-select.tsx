'use client';

import { useCallback } from 'react';
import { getLookupFinalResults } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; resultStatus?: string; publicationStatus?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function FinalResultSelect({ value, onChange, resultStatus, publicationStatus, label = 'Kết quả bảo vệ', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupFinalResults({ resultStatus, publicationStatus }), [resultStatus, publicationStatus]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn kết quả" emptyText="Chưa có kết quả phù hợp." disabled={disabled} error={error} required />;
}
