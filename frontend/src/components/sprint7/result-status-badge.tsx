export function ResultStatusBadge({ status }: { status: string }) {
  const className = status === 'PASSED' ? 'bg-green-50 text-green-700 ring-green-100' : status === 'FAILED' ? 'bg-red-50 text-red-700 ring-red-100' : 'bg-amber-50 text-amber-700 ring-amber-100';
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${className}`}>{status}</span>;
}
