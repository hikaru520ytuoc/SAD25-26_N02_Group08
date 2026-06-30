'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LookupOption } from '@/services/lookups.service';

type Props = {
  label?: string;
  value?: string;
  onChange: (value: string, option?: LookupOption) => void;
  loadOptions: () => Promise<LookupOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
};

export function LookupSelect({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = 'Chọn dữ liệu',
  searchPlaceholder = 'Tìm theo tên hoặc mã...',
  emptyText = 'Không có dữ liệu phù hợp. Hãy tạo dữ liệu trước.',
  disabled,
  required,
  error,
  className,
}: Props) {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError('');
    loadOptions()
      .then((data) => {
        if (mounted) setOptions(data);
      })
      .catch((err) => {
        if (mounted) setLoadError(err instanceof Error ? err.message : 'Không thể tải danh sách lựa chọn');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [loadOptions]);

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => [option.label, option.subLabel, option.code, option.status].filter(Boolean).join(' ').toLowerCase().includes(keyword));
  }, [options, search]);

  const selectedOption = options.find((option) => option.id === value);

  return (
    <div className={className}>
      {label ? (
        <label className="text-sm font-medium text-slate-700">
          {label} {required ? <span className="text-rose-600">*</span> : null}
        </label>
      ) : null}
      <div className="mt-2 space-y-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={disabled || loading}
          placeholder={loading ? 'Đang tải danh sách...' : searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:bg-slate-50"
        />
        <select
          value={value ?? ''}
          disabled={disabled || loading || Boolean(loadError)}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue, options.find((option) => option.id === nextValue));
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:bg-slate-50"
        >
          <option value="">{loading ? 'Đang tải...' : placeholder}</option>
          {filteredOptions.map((option) => (
            <option key={option.id} value={option.id} disabled={option.disabled}>
              {option.label}{option.subLabel ? ` — ${option.subLabel}` : ''}{option.disabledReason ? ` (${option.disabledReason})` : ''}
            </option>
          ))}
        </select>
      </div>
      {!loading && !loadError && filteredOptions.length === 0 ? <p className="mt-1 text-xs text-slate-500">{emptyText}</p> : null}
      {selectedOption?.subLabel ? <p className="mt-1 text-xs text-slate-500">Đã chọn: {selectedOption.label} · {selectedOption.subLabel}</p> : null}
      {loadError ? <p className="mt-1 text-xs text-rose-600">{loadError}</p> : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
