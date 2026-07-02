'use client';

import { useCallback } from 'react';
import { getLookupMajors, type LookupOption } from '@/services/lookups.service';
import { LookupSelect } from './lookup-select';

type Props = {
  value?: string;
  onChange: (value: string, option?: LookupOption) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export function MajorSelect({ value, onChange, label = 'Ngành học', disabled, error, className }: Props) {
  const loadOptions = useCallback(() => getLookupMajors(), []);
  return (
    <LookupSelect
      className={className}
      label={label}
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      placeholder="Chọn ngành học"
      emptyText="Chưa có dữ liệu ngành trong cơ sở dữ liệu."
      disabled={disabled}
      error={error}
    />
  );
}
