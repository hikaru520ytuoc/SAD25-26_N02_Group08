'use client';

import { CalendarDays } from 'lucide-react';
import { forwardRef, useMemo, useRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export { parseVietnameseDate, toVietnameseDate, toIsoDate } from '@/lib/vietnamese-date';
import { toIsoDate, toVietnameseDate } from '@/lib/vietnamese-date';

export const VietnameseDateInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & { value?: string; onChange?: (value: string) => void; error?: string }>(function VietnameseDateInput({ value = '', onChange, className, error, ...props }, ref) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const pickerValue = useMemo(() => toIsoDate(value), [value]);

  function normalize() {
    const formatted = toVietnameseDate(value);
    if (formatted) onChange?.(formatted);
  }

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === 'function') picker.showPicker();
    else picker.click();
  }

  return <div><div className="relative"><input ref={ref} {...props} value={value} onChange={(event) => onChange?.(event.target.value)} onBlur={(event) => { normalize(); props.onBlur?.(event); }} placeholder={props.placeholder ?? 'dd/MM/yyyy'} inputMode="numeric" aria-invalid={Boolean(error)} className={cn('w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100', className)} /><input ref={pickerRef} type="date" value={pickerValue} tabIndex={-1} aria-hidden="true" onChange={(event) => onChange?.(toVietnameseDate(event.target.value))} className="pointer-events-none absolute right-3 top-1/2 h-px w-px -translate-y-1/2 opacity-0" /><button type="button" onClick={openPicker} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Chọn ngày"><CalendarDays className="h-4 w-4" /></button></div>{error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}</div>;
});
