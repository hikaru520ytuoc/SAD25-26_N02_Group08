'use client';

export type DropdownOption = { value: string; label: string; description?: string };

export function DropdownSelect({ label, value, onChange, options, placeholder = 'Chọn một giá trị', disabled = false, required = false, helpText }: { label?: string; value: string; onChange: (value: string) => void; options: DropdownOption[]; placeholder?: string; disabled?: boolean; required?: boolean; helpText?: string }) {
  return <label className="block"><span className="text-sm font-semibold text-slate-800">{label}{required && <span className="text-red-600"> *</span>}</span><select value={value} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{helpText && <span className="mt-1 block text-xs text-slate-500">{helpText}</span>}</label>;
}
