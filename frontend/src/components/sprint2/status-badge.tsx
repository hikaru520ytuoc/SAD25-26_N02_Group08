type Props = {
  value: string;
};

const colorMap: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  CLOSED: 'bg-slate-100 text-slate-700 ring-slate-200',
  DRAFT: 'bg-amber-50 text-amber-700 ring-amber-100',
  ARCHIVED: 'bg-slate-100 text-slate-500 ring-slate-200',
  ELIGIBLE: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  NOT_ELIGIBLE: 'bg-red-50 text-red-700 ring-red-100',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
  SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-100',
  APPROVED: 'bg-violet-50 text-violet-700 ring-violet-100',
  REJECTED: 'bg-red-50 text-red-700 ring-red-100',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export function StatusBadge({ value }: Props) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${colorMap[value] ?? 'bg-slate-50 text-slate-700 ring-slate-100'}`}>
      {value}
    </span>
  );
}
