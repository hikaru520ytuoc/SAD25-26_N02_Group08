'use client';

import { useCallback } from 'react';
import { getLookupReviewers } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';
import type { LookupOption } from '@/services/lookups.service';

type Props = { value?: string; onChange: (value: string, option?: LookupOption) => void; excludeLecturerId?: string; label?: string; disabled?: boolean; error?: string; className?: string };

export function ReviewerSelect({ value, onChange, excludeLecturerId, label = 'GVPB', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupReviewers({ excludeLecturerId }), [excludeLecturerId]);
  return <LookupSelect className={className} label={label} value={value} onChange={onChange} loadOptions={loadOptions} placeholder="Chọn GVPB" emptyText="Không có GVPB phù hợp hoặc GVHD hiện tại đã được loại khỏi danh sách." disabled={disabled} error={error} required />;
}
